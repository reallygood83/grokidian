import { XAIClient } from '../api/xai-client';
import { ChatMessage } from '../api/types';
import { StyleTemplate } from '../api/types';
import { getStyleById, getDefaultStyle } from '../constants/styles';

const CHAT_MODEL = 'grok-3-mini';

const SYSTEM_PROMPT = `You are an elite AI image prompt engineer with expertise in visual storytelling and artistic direction.

YOUR MISSION:
Transform written content into vivid, detailed image generation prompts that capture the essence and emotion of the source material.

PROMPT ENGINEERING PRINCIPLES:
1. **Content Fidelity**: Extract the core visual themes, subjects, and emotions from the note
2. **Specificity**: Include precise details - colors, textures, lighting conditions, camera angles
3. **Atmosphere**: Capture the mood and tone - is it mysterious, joyful, technical, dramatic?
4. **Composition**: Describe spatial relationships, foreground/background, focal points
5. **Style Alignment**: Seamlessly integrate the requested artistic style

PROMPT STRUCTURE (follow this order):
[Style prefix] + [Main subject with details] + [Setting/Environment] + [Lighting/Atmosphere] + [Composition details] + [Quality enhancers]

QUALITY MARKERS TO INCLUDE:
- Lighting: "golden hour lighting", "dramatic shadows", "soft diffused light", "rim lighting"
- Details: "intricate details", "fine textures", "subtle gradients"
- Composition: "rule of thirds", "leading lines", "depth of field", "dynamic angle"
- Technical: "8K resolution", "professional quality", "masterful execution"

WHAT TO AVOID:
- Generic descriptions ("beautiful", "nice", "good")
- Abstract concepts that cannot be visualized
- Conflicting style elements
- Overly long prompts (keep under 150 words)

OUTPUT RULES:
- Return EXACTLY the requested number of prompts
- Each prompt on a new line
- NO numbering, NO labels, NO explanations
- Start each prompt directly with the visual content
- Each prompt must be unique, exploring different aspects of the content`;

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
    styleId: string
  ): Promise<AIPromptGenerationResult> {
    const style = getStyleById(styleId) || getDefaultStyle();
    const userPrompt = this.buildEnhancedUserPrompt(noteContent, imageCount, style);
    
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt }
    ];

    const response = await this.client.chatCompletion({
      model: CHAT_MODEL,
      messages,
      temperature: 0.8,
      max_tokens: 3000
    });

    const aiResponse = response.choices[0]?.message?.content || '';
    const prompts = this.parseAndEnhancePrompts(aiResponse, imageCount, style);

    return {
      prompts,
      analysis: aiResponse
    };
  }

  private buildEnhancedUserPrompt(
    noteContent: string,
    imageCount: number,
    style: StyleTemplate
  ): string {
    const contentAnalysis = this.analyzeContent(noteContent);
    const truncatedContent = noteContent.length > 4000 
      ? noteContent.substring(0, 4000) + '\n...[content continues]'
      : noteContent;

    return `CREATE ${imageCount} UNIQUE IMAGE PROMPT(S)

═══════════════════════════════════════
ARTISTIC STYLE: ${style.name} (Tier ${style.tier})
═══════════════════════════════════════
Style Direction: ${style.modifier}
Visual Qualities: ${style.qualityEnhancers}
Best Applied To: ${style.bestFor.join(', ')}

═══════════════════════════════════════
CONTENT ANALYSIS
═══════════════════════════════════════
Content Type: ${contentAnalysis.type}
Key Themes: ${contentAnalysis.themes.join(', ')}
Emotional Tone: ${contentAnalysis.tone}
Visual Potential: ${contentAnalysis.visualElements.join(', ')}

═══════════════════════════════════════
SOURCE CONTENT
═══════════════════════════════════════
${truncatedContent}

═══════════════════════════════════════
YOUR TASK
═══════════════════════════════════════
Generate ${imageCount} distinct prompts that:

1. CAPTURE THE ESSENCE: Each prompt should visualize a different key aspect or moment from the content
2. MATCH THE STYLE: Fully embrace "${style.name}" aesthetic - ${style.modifier}
3. BE SPECIFIC: Include concrete visual details, not abstract concepts
4. VARY PERSPECTIVES: Use different angles, scales, and focal points across prompts
5. MAINTAIN COHERENCE: All prompts should feel related but visually distinct

${imageCount > 1 ? `
PROMPT DISTRIBUTION GUIDE:
- Prompt 1: Overview/establishing shot - capture the main concept
- Prompt 2: Detail focus - zoom into a specific element
${imageCount > 2 ? '- Prompt 3: Atmospheric/emotional - convey the feeling or mood' : ''}
${imageCount > 3 ? '- Prompt 4+: Alternative perspectives or secondary themes' : ''}
` : ''}

NOW OUTPUT ${imageCount} PROMPT(S), each on a new line:`;
  }

  private analyzeContent(content: string): { 
    type: string; 
    themes: string[]; 
    tone: string; 
    visualElements: string[] 
  } {
    const lowerContent = content.toLowerCase();
    
    let type = 'General Content';
    if (/\b(learn|teach|explain|concept|theory|principle)\b/i.test(content)) {
      type = 'Educational/Instructional';
    } else if (/\b(story|character|scene|chapter|narrative)\b/i.test(content)) {
      type = 'Creative/Narrative';
    } else if (/\b(data|analysis|research|study|experiment)\b/i.test(content)) {
      type = 'Scientific/Analytical';
    } else if (/\b(code|function|api|system|architecture)\b/i.test(content)) {
      type = 'Technical/Engineering';
    } else if (/\b(history|ancient|century|era|civilization)\b/i.test(content)) {
      type = 'Historical';
    }

    const themes: string[] = [];
    const themePatterns = [
      { pattern: /nature|forest|ocean|mountain|sky/i, theme: 'Nature & Landscapes' },
      { pattern: /technology|digital|computer|ai|robot/i, theme: 'Technology' },
      { pattern: /human|people|person|character|face/i, theme: 'Human Elements' },
      { pattern: /abstract|concept|idea|theory|philosophy/i, theme: 'Abstract Concepts' },
      { pattern: /space|universe|cosmic|star|planet/i, theme: 'Cosmic/Space' },
      { pattern: /city|urban|building|architecture/i, theme: 'Urban/Architecture' },
      { pattern: /science|biology|chemistry|physics/i, theme: 'Scientific' },
      { pattern: /art|creative|design|aesthetic/i, theme: 'Artistic/Creative' }
    ];

    for (const { pattern, theme } of themePatterns) {
      if (pattern.test(content)) {
        themes.push(theme);
      }
    }
    if (themes.length === 0) themes.push('General Theme');

    let tone = 'Neutral';
    if (/exciting|amazing|incredible|fantastic|wonderful/i.test(content)) {
      tone = 'Enthusiastic & Positive';
    } else if (/serious|important|critical|essential|crucial/i.test(content)) {
      tone = 'Serious & Professional';
    } else if (/mystery|secret|hidden|unknown|discover/i.test(content)) {
      tone = 'Mysterious & Intriguing';
    } else if (/calm|peace|gentle|soft|quiet/i.test(content)) {
      tone = 'Calm & Serene';
    }

    const visualElements: string[] = [];
    const visualPatterns = [
      { pattern: /color|red|blue|green|golden|silver/i, element: 'Color emphasis' },
      { pattern: /light|glow|shine|bright|dark|shadow/i, element: 'Lighting dynamics' },
      { pattern: /large|huge|tiny|small|vast|miniature/i, element: 'Scale contrast' },
      { pattern: /moving|flowing|dynamic|static|still/i, element: 'Motion elements' },
      { pattern: /texture|smooth|rough|soft|hard/i, element: 'Textural details' }
    ];

    for (const { pattern, element } of visualPatterns) {
      if (pattern.test(content)) {
        visualElements.push(element);
      }
    }
    if (visualElements.length === 0) visualElements.push('Standard visual treatment');

    return { type, themes: themes.slice(0, 3), tone, visualElements: visualElements.slice(0, 3) };
  }

  private parseAndEnhancePrompts(aiResponse: string, expectedCount: number, style: StyleTemplate): string[] {
    let prompts = aiResponse
      .split('\n')
      .map(line => line.trim())
      .filter(line => {
        if (!line || line.length < 30) return false;
        if (/^(prompt|image|output|here|═|─|note:|content:)/i.test(line)) return false;
        if (line.startsWith('#') || line.startsWith('*') && line.endsWith('*')) return false;
        return true;
      })
      .map(line => {
        let cleaned = line
          .replace(/^\d+[\.\):\-]\s*/g, '')
          .replace(/^[-*•]\s*/g, '')
          .replace(/^["'`]|["'`]$/g, '')
          .replace(/^\*\*|\*\*$/g, '')
          .trim();
        
        return cleaned;
      })
      .filter(line => line.length > 30);

    prompts = prompts.map(prompt => this.enhancePrompt(prompt, style));

    if (prompts.length === 0) {
      return this.createIntelligentFallback(expectedCount, style);
    }

    while (prompts.length < expectedCount) {
      const basePrompt = prompts[prompts.length % prompts.length];
      const enhancementSuffixes = [
        ', captured from a unique vantage point with dramatic perspective',
        ', with emphasis on intricate details and fine textures',
        ', bathed in atmospheric lighting that creates depth and dimension',
        ', showcasing the interplay of light and shadow',
        ', rendered with cinematic composition and visual storytelling'
      ];
      const suffix = enhancementSuffixes[(prompts.length - 1) % enhancementSuffixes.length];
      prompts.push(basePrompt + suffix);
    }

    return prompts.slice(0, expectedCount);
  }

  private enhancePrompt(prompt: string, style: StyleTemplate): string {
    const lowerPrompt = prompt.toLowerCase();
    
    let enhanced = prompt;
    
    if (!lowerPrompt.includes(style.name.toLowerCase()) && 
        !lowerPrompt.includes('style') &&
        !lowerPrompt.includes('artistic')) {
      enhanced = `${style.modifier} ${enhanced}`;
    }
    
    const hasQuality = /\b(detailed|quality|resolution|professional|masterful|8k|4k)\b/i.test(enhanced);
    if (!hasQuality) {
      enhanced = `${enhanced}, ${style.qualityEnhancers}`;
    }
    
    const hasLighting = /\b(light|lighting|illumin|glow|shadow|bright|dark)\b/i.test(enhanced);
    if (!hasLighting) {
      enhanced = `${enhanced}, with professional lighting`;
    }
    
    return enhanced;
  }

  private createIntelligentFallback(count: number, style: StyleTemplate): string[] {
    const prompts: string[] = [];
    
    const fallbackTemplates = [
      `${style.modifier} A stunning visual composition showcasing artistic excellence, with masterful use of light and shadow, ${style.qualityEnhancers}`,
      `${style.modifier} An evocative scene with rich atmospheric depth and compelling visual narrative, ${style.qualityEnhancers}`,
      `${style.modifier} A detailed study in form and color, demonstrating technical mastery and creative vision, ${style.qualityEnhancers}`
    ];
    
    for (let i = 0; i < count; i++) {
      prompts.push(fallbackTemplates[i % fallbackTemplates.length]);
    }
    
    return prompts;
  }
}
