import { XAIClient } from '../api/xai-client';
import { ChatMessage, UseCaseTemplateId } from '../api/types';
import { StyleTemplate } from '../api/types';
import { getStyleById, getDefaultStyle } from '../constants/styles';
import { getUseCaseById, getDefaultUseCase } from '../constants/use-cases';

const CHAT_MODEL = 'grok-3-mini';

const SYSTEM_PROMPT = `You are an expert AI image prompt engineer specializing in creating detailed, effective prompts for AI image generation.

Your task is to analyze the given note content and generate optimal image prompts that will create visually stunning, relevant images.

RULES:
1. Read and deeply understand the note content
2. Identify the main concepts, themes, and visual elements
3. Create detailed, descriptive prompts optimized for AI image generation
4. Include specific details about composition, lighting, mood, and style
5. Avoid abstract concepts that can't be visualized
6. Focus on concrete, visual elements
7. Each prompt should be self-contained and complete
8. Prompts should be 50-150 words for optimal results

OUTPUT FORMAT:
Return ONLY the prompts, one per line, without numbering or additional text.
Each prompt should start directly with the visual description.`;

export interface AIPromptGenerationResult {
  prompts: string[];
  analysis: string;
}

export class AIPromptService {
  private client: XAIClient;

  constructor(client: XAIClient) {
    this.client = client;
  }

  async generatePromptsFromNote(
    noteContent: string,
    imageCount: number,
    styleId: string,
    useCaseId: UseCaseTemplateId | 'auto_detect'
  ): Promise<AIPromptGenerationResult> {
    const style = getStyleById(styleId) || getDefaultStyle();
    const useCase = useCaseId === 'auto_detect' 
      ? getDefaultUseCase() 
      : (getUseCaseById(useCaseId) || getDefaultUseCase());

    const userPrompt = this.buildUserPrompt(noteContent, imageCount, style, useCase);
    
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ];

    const response = await this.client.chatCompletion({
      model: CHAT_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 2000
    });

    const aiResponse = response.choices[0]?.message?.content || '';
    const prompts = this.parsePrompts(aiResponse, imageCount, style);

    return {
      prompts,
      analysis: aiResponse
    };
  }

  private buildUserPrompt(
    noteContent: string,
    imageCount: number,
    style: StyleTemplate,
    useCase: { name: string; description: string }
  ): string {
    const truncatedContent = noteContent.length > 3000 
      ? noteContent.substring(0, 3000) + '...[truncated]'
      : noteContent;

    return `Analyze the following note and generate ${imageCount} unique image prompt(s).

STYLE: ${style.name}
Style characteristics: ${style.modifier}
Quality enhancers to include: ${style.qualityEnhancers}

USE CASE: ${useCase.name}
Description: ${useCase.description}

NOTE CONTENT:
---
${truncatedContent}
---

Generate ${imageCount} distinct, detailed image prompt(s) that:
1. Capture the key visual concepts from this note
2. Are optimized for the "${style.name}" artistic style
3. Serve the "${useCase.name}" use case
4. Include specific visual details (colors, composition, lighting, perspective)
5. Are suitable for educational/professional use

Remember: Output ONLY the prompts, one per line, starting directly with the visual description.`;
  }

  private parsePrompts(aiResponse: string, expectedCount: number, style: StyleTemplate): string[] {
    const lines = aiResponse
      .split('\n')
      .map(line => line.trim())
      .filter(line => {
        if (!line || line.length < 20) return false;
        if (line.match(/^\d+[\.\)]/)) {
          return true;
        }
        if (line.toLowerCase().startsWith('prompt')) return false;
        if (line.startsWith('-') || line.startsWith('*')) return true;
        return line.length > 30;
      })
      .map(line => {
        let cleaned = line
          .replace(/^\d+[\.\)]\s*/, '')
          .replace(/^[-*]\s*/, '')
          .replace(/^["']|["']$/g, '')
          .trim();
        
        if (!cleaned.toLowerCase().includes(style.name.toLowerCase())) {
          cleaned = `${style.modifier} ${cleaned}`;
        }
        
        if (!cleaned.toLowerCase().includes('quality') && 
            !cleaned.toLowerCase().includes('detailed')) {
          cleaned = `${cleaned}, ${style.qualityEnhancers}`;
        }
        
        return cleaned;
      });

    if (lines.length === 0) {
      return this.createFallbackPrompts(expectedCount, style);
    }

    while (lines.length < expectedCount) {
      const basePrompt = lines[lines.length - 1] || lines[0];
      const variations = [
        'from a different angle',
        'with dramatic lighting',
        'in close-up detail',
        'showing the full context',
        'with atmospheric depth'
      ];
      const variation = variations[(lines.length - 1) % variations.length];
      lines.push(`${basePrompt}, ${variation}`);
    }

    return lines.slice(0, expectedCount);
  }

  private createFallbackPrompts(count: number, style: StyleTemplate): string[] {
    const prompts: string[] = [];
    const basePrompt = `${style.modifier} A detailed visual representation, ${style.qualityEnhancers}`;
    
    for (let i = 0; i < count; i++) {
      prompts.push(basePrompt);
    }
    
    return prompts;
  }

  async generateSinglePrompt(
    noteContent: string,
    styleId: string,
    useCaseId: UseCaseTemplateId | 'auto_detect'
  ): Promise<string> {
    const result = await this.generatePromptsFromNote(noteContent, 1, styleId, useCaseId);
    return result.prompts[0] || '';
  }
}
