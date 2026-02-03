import { App, Modal, Setting, DropdownComponent, Notice } from 'obsidian';
import { GrokidianSettings, AspectRatio, UseCaseTemplateId, UseCaseMatch } from '../../api/types';
import { StyleManager } from '../../services/style-manager';
import { USE_CASE_TEMPLATES } from '../../constants/use-cases';
import { MIN_IMAGE_COUNT, MAX_IMAGE_COUNT } from '../../constants/config';

export interface ImageGenOptions {
  style: string;
  aspectRatio: AspectRatio;
  imageCount: number;
  useCase: 'auto_detect' | UseCaseTemplateId;
  generatedPrompt: string;
  confirmed: boolean;
}

export class ImageGenModal extends Modal {
  private settings: GrokidianSettings;
  private styleManager: StyleManager;
  private concepts: string[];
  private detectedUseCase: UseCaseMatch | null;
  private generatedPrompt: string;
  private onSubmit: (options: ImageGenOptions) => void;
  
  private selectedStyle: string;
  private selectedAspectRatio: AspectRatio;
  private selectedImageCount: number;
  private selectedUseCase: 'auto_detect' | UseCaseTemplateId;
  private editedPrompt: string;

  constructor(
    app: App,
    settings: GrokidianSettings,
    concepts: string[],
    detectedUseCase: UseCaseMatch | null,
    generatedPrompt: string,
    onSubmit: (options: ImageGenOptions) => void
  ) {
    super(app);
    this.settings = settings;
    this.styleManager = new StyleManager();
    this.concepts = concepts;
    this.detectedUseCase = detectedUseCase;
    this.generatedPrompt = generatedPrompt;
    this.onSubmit = onSubmit;
    
    this.selectedStyle = settings.defaultStyle;
    this.selectedAspectRatio = settings.defaultAspectRatio;
    this.selectedImageCount = settings.defaultImageCount;
    this.selectedUseCase = settings.defaultUseCase;
    this.editedPrompt = generatedPrompt;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.addClass('grokidian-image-gen-modal');

    contentEl.createEl('h2', { text: 'Generate Images' });

    this.renderConceptsSection(contentEl);
    this.renderUseCaseSection(contentEl);
    this.renderStyleSection(contentEl);
    this.renderOptionsSection(contentEl);
    this.renderPromptSection(contentEl);
    this.renderButtonSection(contentEl);
  }

  private renderConceptsSection(container: HTMLElement) {
    const section = container.createDiv({ cls: 'grokidian-section' });
    section.createEl('h3', { text: 'Detected Concepts' });
    
    const conceptsContainer = section.createDiv({ cls: 'grokidian-concepts-container' });
    for (const concept of this.concepts.slice(0, 8)) {
      conceptsContainer.createEl('span', { 
        text: concept,
        cls: 'grokidian-concept-tag'
      });
    }
  }

  private renderUseCaseSection(container: HTMLElement) {
    const section = container.createDiv({ cls: 'grokidian-section' });
    
    new Setting(section)
      .setName('Use Case Template')
      .setDesc(this.detectedUseCase 
        ? `AI detected: ${this.detectedUseCase.template.icon} ${this.detectedUseCase.template.name} (${this.detectedUseCase.confidence}% confidence)`
        : 'Select a template for image generation')
      .addDropdown(dropdown => {
        dropdown.addOption('auto_detect', '🤖 Auto-Detect (Recommended)');
        
        for (const template of USE_CASE_TEMPLATES) {
          dropdown.addOption(template.id, `${template.icon} ${template.name}`);
        }
        
        dropdown.setValue(this.selectedUseCase);
        dropdown.onChange(value => {
          this.selectedUseCase = value as 'auto_detect' | UseCaseTemplateId;
        });
      });
  }

  private renderStyleSection(container: HTMLElement) {
    const section = container.createDiv({ cls: 'grokidian-section' });
    
    new Setting(section)
      .setName('Image Style')
      .setDesc('Styles are ranked by quality (S > A > B > C)')
      .addDropdown(dropdown => {
        const groupedStyles = this.styleManager.getStylesGroupedByTier();
        
        for (const [tier, styles] of groupedStyles) {
          for (const style of styles) {
            dropdown.addOption(style.id, `[${tier}] ${style.icon} ${style.name}`);
          }
        }
        
        dropdown.setValue(this.selectedStyle);
        dropdown.onChange(value => {
          this.selectedStyle = value;
        });
      });
  }

  private renderOptionsSection(container: HTMLElement) {
    const section = container.createDiv({ cls: 'grokidian-section' });

    new Setting(section)
      .setName('Aspect Ratio')
      .addDropdown(dropdown => {
        const ratios: Record<AspectRatio, string> = {
          '16:9': '16:9 (Landscape)',
          '4:3': '4:3 (Standard)',
          '1:1': '1:1 (Square)',
          '9:16': '9:16 (Portrait)',
          '3:4': '3:4 (Portrait)',
          '3:2': '3:2 (Photo)',
          '2:3': '2:3 (Portrait Photo)'
        };
        
        for (const [value, label] of Object.entries(ratios)) {
          dropdown.addOption(value, label);
        }
        
        dropdown.setValue(this.selectedAspectRatio);
        dropdown.onChange(value => {
          this.selectedAspectRatio = value as AspectRatio;
        });
      });

    new Setting(section)
      .setName('Number of Images')
      .setDesc(`Generate ${MIN_IMAGE_COUNT}-${MAX_IMAGE_COUNT} images`)
      .addSlider(slider => {
        slider
          .setLimits(MIN_IMAGE_COUNT, MAX_IMAGE_COUNT, 1)
          .setValue(this.selectedImageCount)
          .setDynamicTooltip()
          .onChange(value => {
            this.selectedImageCount = value;
          });
      });
  }

  private renderPromptSection(container: HTMLElement) {
    const section = container.createDiv({ cls: 'grokidian-section' });
    
    const headerContainer = section.createDiv({ cls: 'grokidian-prompt-header' });
    headerContainer.createEl('h3', { text: 'AI-Generated Prompts' });
    headerContainer.createEl('span', { 
      text: 'Powered by Grok AI',
      cls: 'grokidian-ai-badge'
    });

    const promptCount = this.generatedPrompt.split('---').filter(p => p.trim()).length;
    section.createEl('p', {
      text: `${promptCount} unique prompt(s) generated. Each image will use a different prompt. You can edit below.`,
      cls: 'grokidian-prompt-description'
    });
    
    const textarea = section.createEl('textarea', {
      cls: 'grokidian-prompt-textarea'
    });
    textarea.value = this.editedPrompt;
    textarea.rows = 8;
    textarea.placeholder = 'AI-generated prompts will appear here. Separate multiple prompts with ---';
    textarea.addEventListener('input', (e) => {
      this.editedPrompt = (e.target as HTMLTextAreaElement).value;
    });

    const buttonRow = section.createDiv({ cls: 'grokidian-prompt-buttons' });
    
    const resetBtn = buttonRow.createEl('button', {
      text: 'Reset to AI-Generated',
      cls: 'grokidian-reset-prompt-btn'
    });
    resetBtn.addEventListener('click', () => {
      this.editedPrompt = this.generatedPrompt;
      textarea.value = this.generatedPrompt;
    });

    const tipText = section.createEl('p', {
      text: 'Tip: Use "---" to separate prompts for different images.',
      cls: 'grokidian-prompt-tip'
    });
  }

  private renderButtonSection(container: HTMLElement) {
    const buttonContainer = container.createDiv({ cls: 'grokidian-button-container' });

    const generateBtn = buttonContainer.createEl('button', {
      text: 'Generate Images',
      cls: 'mod-cta'
    });
    generateBtn.addEventListener('click', () => {
      this.onSubmit({
        style: this.selectedStyle,
        aspectRatio: this.selectedAspectRatio,
        imageCount: this.selectedImageCount,
        useCase: this.selectedUseCase,
        generatedPrompt: this.editedPrompt,
        confirmed: true
      });
      this.close();
    });

    const cancelBtn = buttonContainer.createEl('button', {
      text: 'Cancel'
    });
    cancelBtn.addEventListener('click', () => {
      this.onSubmit({
        style: this.selectedStyle,
        aspectRatio: this.selectedAspectRatio,
        imageCount: this.selectedImageCount,
        useCase: this.selectedUseCase,
        generatedPrompt: this.editedPrompt,
        confirmed: false
      });
      this.close();
    });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
