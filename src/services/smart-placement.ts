import { NoteStructure, Section, PlacementSuggestion, InsertionLocation } from '../api/types';
import { TOP_PLACEMENT_SUGGESTIONS, MIN_PLACEMENT_SCORE } from '../constants/config';
import { ContentAnalyzer } from './content-analyzer';

export class SmartPlacement {
  private contentAnalyzer: ContentAnalyzer;

  constructor() {
    this.contentAnalyzer = new ContentAnalyzer();
  }

  analyzePlacementOptions(
    noteContent: string,
    imagePrompt: string,
    imageCount: number
  ): PlacementSuggestion[] {
    const structure = this.contentAnalyzer.analyzeStructure(noteContent);
    const imageIntent = this.extractImageIntent(imagePrompt);
    const relevantSections = this.findRelevantSections(structure, imageIntent);
    
    const suggestions: PlacementSuggestion[] = [];
    
    for (const section of relevantSections) {
      const score = this.scoreSection(section, imageIntent);
      
      if (score >= MIN_PLACEMENT_SCORE) {
        const location = this.determineInsertionLocation(section, structure);
        const contextPreview = this.getContextPreview(noteContent, location.lineNumber);
        
        suggestions.push({
          location,
          score,
          reasoning: this.generateReasoning(section, score, imageIntent),
          contextPreview
        });
      }
    }
    
    suggestions.sort((a, b) => b.score - a.score);
    
    return suggestions.slice(0, Math.max(TOP_PLACEMENT_SUGGESTIONS, imageCount));
  }

  scoreSection(section: Section, imageIntent: string): number {
    let score = 0;
    const intentWords = imageIntent.toLowerCase().split(/\s+/);
    const sectionContent = (section.content + ' ' + (section.heading?.text || '')).toLowerCase();
    
    for (const word of intentWords) {
      if (word.length > 3 && sectionContent.includes(word)) {
        score += 15;
      }
    }
    
    for (const topic of section.topics) {
      const topicLower = topic.toLowerCase();
      for (const word of intentWords) {
        if (topicLower.includes(word) || word.includes(topicLower)) {
          score += 20;
        }
      }
    }
    
    if (section.heading) {
      const headingWords = section.heading.text.toLowerCase().split(/\s+/);
      for (const headingWord of headingWords) {
        for (const intentWord of intentWords) {
          if (headingWord === intentWord || 
              (headingWord.length > 4 && intentWord.includes(headingWord)) ||
              (intentWord.length > 4 && headingWord.includes(intentWord))) {
            score += 25;
          }
        }
      }
    }
    
    return Math.min(100, score);
  }

  extractImageIntent(prompt: string): string {
    const cleanPrompt = prompt
      .replace(/^In \w+ style[^,]*,?\s*/i, '')
      .replace(/,\s*(highly detailed|professional|8K|optimized)[^,]*/gi, '')
      .trim();
    
    return cleanPrompt;
  }

  findRelevantSections(structure: NoteStructure, intent: string): Section[] {
    const intentWords = new Set(
      intent.toLowerCase().split(/\s+/).filter(w => w.length > 3)
    );
    
    const scoredSections = structure.sections.map(section => {
      let relevance = 0;
      const sectionText = (section.content + ' ' + (section.heading?.text || '')).toLowerCase();
      
      for (const word of intentWords) {
        if (sectionText.includes(word)) {
          relevance++;
        }
      }
      
      return { section, relevance };
    });
    
    return scoredSections
      .filter(s => s.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .map(s => s.section);
  }

  private determineInsertionLocation(section: Section, structure: NoteStructure): InsertionLocation {
    if (section.heading) {
      return {
        lineNumber: section.heading.line,
        position: 'after',
        anchor: `${'#'.repeat(section.heading.level)} ${section.heading.text}`
      };
    }
    
    return {
      lineNumber: section.startLine,
      position: 'after',
      anchor: section.content.split('\n')[0]?.substring(0, 50) || 'Section start'
    };
  }

  private getContextPreview(content: string, lineNumber: number): string {
    const lines = content.split('\n');
    const startLine = Math.max(0, lineNumber - 2);
    const endLine = Math.min(lines.length, lineNumber + 2);
    
    return lines
      .slice(startLine, endLine)
      .map((line, idx) => {
        const actualLine = startLine + idx + 1;
        const marker = actualLine === lineNumber ? '>>> ' : '    ';
        return `${marker}${actualLine}: ${line.substring(0, 60)}${line.length > 60 ? '...' : ''}`;
      })
      .join('\n');
  }

  private generateReasoning(section: Section, score: number, intent: string): string {
    if (section.heading) {
      return `Section "${section.heading.text}" discusses related topics (${score}% relevance)`;
    }
    
    const topicList = section.topics.slice(0, 3).join(', ');
    return `Section contains relevant concepts: ${topicList} (${score}% relevance)`;
  }

  suggestForMultipleImages(
    noteContent: string,
    imagePrompts: string[]
  ): Map<number, PlacementSuggestion> {
    const assignments = new Map<number, PlacementSuggestion>();
    const usedLines = new Set<number>();
    
    for (let i = 0; i < imagePrompts.length; i++) {
      const suggestions = this.analyzePlacementOptions(noteContent, imagePrompts[i], 1);
      
      for (const suggestion of suggestions) {
        if (!usedLines.has(suggestion.location.lineNumber)) {
          assignments.set(i, suggestion);
          usedLines.add(suggestion.location.lineNumber);
          break;
        }
      }
      
      if (!assignments.has(i) && suggestions.length > 0) {
        assignments.set(i, suggestions[0]);
      }
    }
    
    return assignments;
  }
}
