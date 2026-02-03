import { UseCaseTemplate, UseCaseTemplateId } from '../api/types';
import { StyleTemplate } from '../api/types';
import { getStyleById, getDefaultStyle } from '../constants/styles';
import { getUseCaseById, getDefaultUseCase } from '../constants/use-cases';

export class PromptGenerator {
  generateAutoPrompt(
    concepts: string[],
    useCaseId: UseCaseTemplateId | 'auto_detect',
    styleId: string,
    detectedUseCase?: UseCaseTemplate
  ): string {
    const style = getStyleById(styleId) || getDefaultStyle();
    const useCase = useCaseId === 'auto_detect' 
      ? (detectedUseCase || getDefaultUseCase())
      : (getUseCaseById(useCaseId as UseCaseTemplateId) || getDefaultUseCase());
    
    const basePrompt = this.applyTemplate(useCase, concepts);
    const styledPrompt = this.applyStyleModifier(basePrompt, style);
    const optimizedPrompt = this.optimizePrompt(styledPrompt, style);
    
    return optimizedPrompt;
  }

  applyTemplate(useCase: UseCaseTemplate, concepts: string[]): string {
    let prompt = useCase.promptPattern;
    
    const primaryConcepts = concepts.slice(0, 3).join(', ');
    const secondaryConcepts = concepts.slice(3, 6).join(', ');
    const allConcepts = concepts.join(', ');
    
    prompt = prompt.replace('{concepts}', primaryConcepts || 'the main subject');
    prompt = prompt.replace('{relationships}', secondaryConcepts || 'key relationships');
    prompt = prompt.replace('{elements}', secondaryConcepts || 'supporting elements');
    prompt = prompt.replace('{process}', primaryConcepts || 'the process');
    prompt = prompt.replace('{character}', concepts[0] || 'the character');
    prompt = prompt.replace('{traits}', secondaryConcepts || 'distinctive traits');
    prompt = prompt.replace('{setting}', primaryConcepts || 'the environment');
    prompt = prompt.replace('{data}', primaryConcepts || 'the data points');
    prompt = prompt.replace('{subject}', primaryConcepts || 'the subject');
    prompt = prompt.replace('{structure}', primaryConcepts || 'the structure');
    prompt = prompt.replace('{product}', primaryConcepts || 'the product');
    
    return prompt;
  }

  applyStyleModifier(basePrompt: string, style: StyleTemplate): string {
    return `${style.modifier} ${basePrompt}`;
  }

  optimizePrompt(prompt: string, style: StyleTemplate): string {
    const qualityEnhancers = style.qualityEnhancers;
    const aspectHint = 'optimized for 16:9 aspect ratio';
    
    return `${prompt}, ${qualityEnhancers}, ${aspectHint}`;
  }

  validatePrompt(prompt: string): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    if (prompt.length < 10) {
      issues.push('Prompt is too short');
    }
    
    if (prompt.length > 4000) {
      issues.push('Prompt exceeds maximum length');
    }
    
    const placeholderPattern = /\{[^}]+\}/g;
    const remainingPlaceholders = prompt.match(placeholderPattern);
    if (remainingPlaceholders) {
      issues.push(`Unresolved placeholders: ${remainingPlaceholders.join(', ')}`);
    }
    
    return {
      valid: issues.length === 0,
      issues
    };
  }

  generateMultiplePrompts(
    concepts: string[],
    useCaseId: UseCaseTemplateId | 'auto_detect',
    styleId: string,
    count: number,
    detectedUseCase?: UseCaseTemplate
  ): string[] {
    const prompts: string[] = [];
    const basePrompt = this.generateAutoPrompt(concepts, useCaseId, styleId, detectedUseCase);
    
    prompts.push(basePrompt);
    
    const variations = [
      'from a different perspective',
      'with emphasis on details',
      'showing the overall context',
      'focusing on key elements',
      'with dramatic composition',
      'in a minimalist approach',
      'highlighting relationships',
      'with depth and layers',
      'from an aerial view',
    ];
    
    for (let i = 1; i < count && i < variations.length + 1; i++) {
      const variation = variations[(i - 1) % variations.length];
      prompts.push(`${basePrompt}, ${variation}`);
    }
    
    return prompts;
  }
}
