import { UseCaseMatch, UseCaseTemplate, UseCaseTemplateId } from '../api/types';
import { USE_CASE_TEMPLATES, getDefaultUseCase } from '../constants/use-cases';
import { MIN_CONFIDENCE_SCORE } from '../constants/config';

export class UseCaseDetector {
  detectUseCase(content: string, concepts: string[]): UseCaseMatch {
    const allMatches = this.getAllMatches(content, concepts);
    
    if (allMatches.length > 0 && allMatches[0].confidence >= MIN_CONFIDENCE_SCORE) {
      return allMatches[0];
    }
    
    return {
      template: getDefaultUseCase(),
      confidence: 50,
      reasoning: 'No strong match found, using default template for concept visualization'
    };
  }

  getAllMatches(content: string, concepts: string[]): UseCaseMatch[] {
    const matches: UseCaseMatch[] = [];
    
    for (const template of USE_CASE_TEMPLATES) {
      const score = this.scoreTemplate(template, content, concepts);
      if (score > 0) {
        matches.push({
          template,
          confidence: Math.min(100, score),
          reasoning: this.generateReasoning(template, score, content)
        });
      }
    }
    
    return matches.sort((a, b) => b.confidence - a.confidence);
  }

  scoreTemplate(template: UseCaseTemplate, content: string, concepts: string[]): number {
    let score = 0;
    const lowerContent = content.toLowerCase();
    const lowerConcepts = concepts.map(c => c.toLowerCase());
    
    for (const keyword of template.keywords) {
      const keywordLower = keyword.toLowerCase();
      
      const directMatches = (lowerContent.match(new RegExp(keywordLower, 'gi')) || []).length;
      score += directMatches * 10;
      
      for (const concept of lowerConcepts) {
        if (concept.includes(keywordLower) || keywordLower.includes(concept)) {
          score += 15;
        }
      }
    }
    
    score += this.getContextBonus(template.id, content);
    
    return score;
  }

  private getContextBonus(templateId: UseCaseTemplateId, content: string): number {
    const lowerContent = content.toLowerCase();
    
    switch (templateId) {
      case 'educational_diagram':
        if (/diagram|flowchart|illustration|explain/i.test(content)) return 20;
        break;
      case 'scientific_illustration':
        if (/μ|∑|∂|∫|≈|→|←/i.test(content)) return 25;
        if (/equation|formula|theorem/i.test(content)) return 15;
        break;
      case 'character_illustration':
        if (/she said|he said|replied|answered|whispered/i.test(content)) return 25;
        break;
      case 'process_flow':
        if (/step \d|first|then|next|finally/i.test(content)) return 20;
        break;
      case 'data_visualization':
        if (/\d+%|\d+\.\d+|increase|decrease|growth/i.test(content)) return 20;
        break;
      case 'historical_recreation':
        if (/\d{3,4}\s*(AD|BC|CE|BCE)|century/i.test(content)) return 25;
        break;
      case 'architectural_visualization':
        if (/floor|room|building|structure|design/i.test(content)) return 15;
        break;
    }
    
    return 0;
  }

  private generateReasoning(template: UseCaseTemplate, score: number, content: string): string {
    const matchedKeywords: string[] = [];
    const lowerContent = content.toLowerCase();
    
    for (const keyword of template.keywords) {
      if (lowerContent.includes(keyword.toLowerCase())) {
        matchedKeywords.push(keyword);
        if (matchedKeywords.length >= 3) break;
      }
    }
    
    if (matchedKeywords.length > 0) {
      return `Content contains key indicators: ${matchedKeywords.join(', ')}`;
    }
    
    return `Best match based on content analysis (score: ${score})`;
  }
}
