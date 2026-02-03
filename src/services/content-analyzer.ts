import { ContentType, NoteStructure, Heading, Section, Paragraph, CodeBlock, ListItem } from '../api/types';
import { MAX_CONCEPTS_TO_EXTRACT } from '../constants/config';

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
  'shall', 'can', 'need', 'dare', 'ought', 'used', 'it', 'its', 'this', 'that',
  'these', 'those', 'i', 'you', 'he', 'she', 'we', 'they', 'what', 'which', 'who',
  'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
  'than', 'too', 'very', 'just', 'also', 'now', 'here', 'there', 'then', 'once'
]);

const CONTENT_TYPE_PATTERNS: Record<ContentType, RegExp[]> = {
  educational: [
    /learn|teach|explain|concept|principle|theory|fundamentals|introduction|guide|tutorial/i,
    /chapter|lesson|module|curriculum|course/i
  ],
  scientific: [
    /experiment|hypothesis|research|study|analysis|data|result|conclusion/i,
    /cell|molecule|atom|chemical|physics|biology|quantum|neural/i
  ],
  creative_fiction: [
    /character|story|narrative|plot|scene|chapter|protagonist|antagonist/i,
    /fiction|novel|tale|adventure|fantasy|mystery/i
  ],
  technical: [
    /code|function|algorithm|system|architecture|implementation|api|database/i,
    /programming|software|development|engineering|technical/i
  ],
  historical: [
    /history|historical|century|era|period|ancient|medieval|modern/i,
    /war|revolution|civilization|empire|dynasty|kingdom/i
  ],
  business: [
    /business|strategy|market|revenue|profit|growth|startup|enterprise/i,
    /management|leadership|team|organization|company/i
  ],
  philosophical: [
    /philosophy|ethics|moral|existence|consciousness|meaning|truth/i,
    /argument|logic|reasoning|metaphysics|epistemology/i
  ],
  personal_notes: [
    /note|reminder|todo|task|meeting|idea|thought|journal/i
  ]
};

export class ContentAnalyzer {
  extractConcepts(content: string, maxConcepts: number = MAX_CONCEPTS_TO_EXTRACT): string[] {
    const weightedTerms = new Map<string, number>();
    
    const headings = this.extractHeadingTexts(content);
    for (const heading of headings) {
      this.addTermsWithWeight(heading, weightedTerms, 3.0);
    }
    
    const emphasized = this.extractEmphasizedText(content);
    for (const text of emphasized) {
      this.addTermsWithWeight(text, weightedTerms, 2.0);
    }
    
    const plainText = this.stripMarkdown(content);
    this.addTermsWithWeight(plainText, weightedTerms, 1.0);
    
    const firstParagraph = this.getFirstParagraph(content);
    this.addTermsWithWeight(firstParagraph, weightedTerms, 1.2);
    
    const sortedTerms = Array.from(weightedTerms.entries())
      .filter(([term]) => term.length > 3 && !STOPWORDS.has(term.toLowerCase()))
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxConcepts)
      .map(([term]) => term);
    
    return sortedTerms;
  }

  detectContentType(content: string): ContentType {
    const scores: Record<ContentType, number> = {
      educational: 0,
      scientific: 0,
      creative_fiction: 0,
      technical: 0,
      historical: 0,
      business: 0,
      philosophical: 0,
      personal_notes: 0
    };

    for (const [type, patterns] of Object.entries(CONTENT_TYPE_PATTERNS)) {
      for (const pattern of patterns) {
        const matches = content.match(pattern);
        if (matches) {
          scores[type as ContentType] += matches.length;
        }
      }
    }

    let maxType: ContentType = 'personal_notes';
    let maxScore = 0;

    for (const [type, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        maxType = type as ContentType;
      }
    }

    return maxType;
  }

  analyzeStructure(content: string): NoteStructure {
    const lines = content.split('\n');
    const headings: Heading[] = [];
    const sections: Section[] = [];
    const paragraphs: Paragraph[] = [];
    const codeBlocks: CodeBlock[] = [];
    const lists: ListItem[] = [];

    let currentSection: Section | null = null;
    let inCodeBlock = false;
    let codeBlockStart = 0;
    let codeBlockLang = '';
    let codeBlockContent: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeBlockStart = lineNum;
          codeBlockLang = line.slice(3).trim();
          codeBlockContent = [];
        } else {
          inCodeBlock = false;
          codeBlocks.push({
            language: codeBlockLang,
            content: codeBlockContent.join('\n'),
            startLine: codeBlockStart,
            endLine: lineNum
          });
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        continue;
      }

      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        const heading: Heading = {
          level: headingMatch[1].length,
          text: headingMatch[2].trim(),
          line: lineNum
        };
        headings.push(heading);

        if (currentSection) {
          currentSection.endLine = lineNum - 1;
          sections.push(currentSection);
        }

        currentSection = {
          heading,
          content: '',
          startLine: lineNum,
          endLine: lines.length,
          topics: this.extractConcepts(headingMatch[2], 3)
        };
        continue;
      }

      const listMatch = line.match(/^(\s*)([-*+]|\d+\.)\s+(.+)$/);
      if (listMatch) {
        lists.push({
          text: listMatch[3].trim(),
          line: lineNum,
          indent: listMatch[1].length
        });
        continue;
      }

      if (line.trim().length > 20) {
        paragraphs.push({
          text: line.trim(),
          line: lineNum,
          topics: this.extractConcepts(line, 2)
        });
      }

      if (currentSection) {
        currentSection.content += line + '\n';
      }
    }

    if (currentSection) {
      currentSection.endLine = lines.length;
      sections.push(currentSection);
    }

    return { headings, sections, paragraphs, codeBlocks, lists };
  }

  getTopicsBySection(content: string): Map<string, string[]> {
    const structure = this.analyzeStructure(content);
    const topicMap = new Map<string, string[]>();

    for (const section of structure.sections) {
      const sectionKey = section.heading?.text || `Section at line ${section.startLine}`;
      const topics = this.extractConcepts(section.content, 5);
      topicMap.set(sectionKey, topics);
    }

    return topicMap;
  }

  detectLanguage(content: string): 'en' | 'ko' | 'other' {
    const koreanPattern = /[\uAC00-\uD7AF]/g;
    const koreanMatches = content.match(koreanPattern) || [];
    const totalChars = content.replace(/\s/g, '').length;

    if (totalChars === 0) return 'en';

    const koreanRatio = koreanMatches.length / totalChars;

    if (koreanRatio > 0.3) return 'ko';
    return 'en';
  }

  private extractHeadingTexts(content: string): string[] {
    const headingPattern = /^#{1,6}\s+(.+)$/gm;
    const matches: string[] = [];
    let match;
    while ((match = headingPattern.exec(content)) !== null) {
      matches.push(match[1]);
    }
    return matches;
  }

  private extractEmphasizedText(content: string): string[] {
    const boldPattern = /\*\*(.+?)\*\*/g;
    const italicPattern = /\*(.+?)\*/g;
    const matches: string[] = [];
    let match;
    
    while ((match = boldPattern.exec(content)) !== null) {
      matches.push(match[1]);
    }
    while ((match = italicPattern.exec(content)) !== null) {
      matches.push(match[1]);
    }
    
    return matches;
  }

  private stripMarkdown(content: string): string {
    return content
      .replace(/#{1,6}\s+/g, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/\[(.+?)\]\(.+?\)/g, '$1')
      .replace(/`{1,3}[^`]*`{1,3}/g, '')
      .replace(/^\s*[-*+]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '');
  }

  private getFirstParagraph(content: string): string {
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length > 30 && !trimmed.startsWith('#') && !trimmed.startsWith('-')) {
        return trimmed;
      }
    }
    return '';
  }

  private addTermsWithWeight(text: string, weightedTerms: Map<string, number>, weight: number): void {
    const words = text.toLowerCase().split(/\s+/);
    
    for (const word of words) {
      const cleanWord = word.replace(/[^a-z가-힣]/gi, '');
      if (cleanWord.length > 2 && !STOPWORDS.has(cleanWord)) {
        const current = weightedTerms.get(cleanWord) || 0;
        weightedTerms.set(cleanWord, current + weight);
      }
    }

    for (let i = 0; i < words.length - 1; i++) {
      const bigram = `${words[i]} ${words[i + 1]}`.replace(/[^a-z가-힣\s]/gi, '').trim();
      if (bigram.split(' ').length === 2 && bigram.length > 5) {
        const current = weightedTerms.get(bigram) || 0;
        weightedTerms.set(bigram, current + weight * 1.5);
      }
    }
  }
}
