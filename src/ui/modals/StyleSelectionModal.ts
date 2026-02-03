import { App, Modal, Setting } from 'obsidian';
import { AspectRatio } from '../../api/types';
import { StyleManager } from '../../services/style-manager';
import { STYLE_TEMPLATES } from '../../constants/styles';
import { MIN_IMAGE_COUNT, MAX_IMAGE_COUNT } from '../../constants/config';

export type ImageSize = 'small' | 'medium' | 'large' | 'extra-large';

export interface StyleSelectionResult {
  confirmed: boolean;
  style: string;
  styleName: string;
  aspectRatio: AspectRatio;
  imageCount: number;
  imageSize: ImageSize;
}

const IMAGE_SIZE_OPTIONS: Record<ImageSize, { label: string; description: string }> = {
  'small': { label: 'Small', description: '256px - Quick preview' },
  'medium': { label: 'Medium', description: '512px - Standard quality' },
  'large': { label: 'Large', description: '1024px - High quality' },
  'extra-large': { label: 'Extra Large', description: '1536px - Maximum quality' }
};

export class StyleSelectionModal extends Modal {
  private styleManager: StyleManager;
  private onComplete: (result: StyleSelectionResult) => void;
  
  private selectedStyle: string = 'hyper_realism';
  private selectedAspectRatio: AspectRatio = '16:9';
  private selectedImageCount: number = 3;
  private selectedImageSize: ImageSize = 'large';
  private stylePreviewEl: HTMLElement | null = null;

  constructor(app: App, onComplete: (result: StyleSelectionResult) => void) {
    super(app);
    this.styleManager = new StyleManager();
    this.onComplete = onComplete;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.addClass('grokidian-style-modal');
    contentEl.empty();

    contentEl.createEl('h2', { text: 'Generate AI Images', cls: 'grokidian-modal-title' });
    contentEl.createEl('p', { 
      text: 'Select style and options. AI will analyze your note and generate optimized prompts.',
      cls: 'grokidian-modal-subtitle'
    });

    this.renderStyleSection(contentEl);
    this.renderSizeSection(contentEl);
    this.renderOptionsSection(contentEl);
    this.renderButtonSection(contentEl);
  }

  private renderStyleSection(container: HTMLElement) {
    const section = container.createDiv({ cls: 'grokidian-section' });
    section.createEl('h3', { text: 'Image Style' });

    const styleGrid = section.createDiv({ cls: 'grokidian-style-grid' });
    
    const groupedStyles = this.styleManager.getStylesGroupedByTier();
    
    for (const [tier, styles] of groupedStyles) {
      const tierLabel = section.createDiv({ cls: 'grokidian-tier-label' });
      tierLabel.createEl('span', { text: `Tier ${tier}`, cls: `grokidian-tier-badge tier-${tier.toLowerCase()}` });
      tierLabel.createEl('span', { text: this.styleManager.getTierDescription(tier), cls: 'grokidian-tier-desc' });
      
      const tierGrid = section.createDiv({ cls: 'grokidian-style-tier-grid' });
      
      for (const style of styles) {
        const styleCard = tierGrid.createDiv({ 
          cls: `grokidian-style-card ${this.selectedStyle === style.id ? 'selected' : ''}`
        });
        styleCard.dataset.styleId = style.id;
        
        styleCard.createEl('span', { text: style.icon, cls: 'grokidian-style-icon' });
        styleCard.createEl('span', { text: style.name, cls: 'grokidian-style-name' });
        
        styleCard.addEventListener('click', () => {
          container.querySelectorAll('.grokidian-style-card').forEach(el => el.removeClass('selected'));
          styleCard.addClass('selected');
          this.selectedStyle = style.id;
          this.updateStylePreview(style.bestFor);
        });
      }
    }

    this.stylePreviewEl = section.createDiv({ cls: 'grokidian-style-preview' });
    const defaultStyle = STYLE_TEMPLATES.find(s => s.id === this.selectedStyle);
    if (defaultStyle) {
      this.updateStylePreview(defaultStyle.bestFor);
    }
  }

  private updateStylePreview(bestFor: string[]) {
    if (!this.stylePreviewEl) return;
    this.stylePreviewEl.empty();
    this.stylePreviewEl.createEl('span', { text: 'Best for: ', cls: 'grokidian-preview-label' });
    this.stylePreviewEl.createEl('span', { text: bestFor.join(', '), cls: 'grokidian-preview-text' });
  }

  private renderSizeSection(container: HTMLElement) {
    const section = container.createDiv({ cls: 'grokidian-section' });
    section.createEl('h3', { text: 'Image Size' });

    const sizeGrid = section.createDiv({ cls: 'grokidian-size-grid' });
    
    for (const [size, info] of Object.entries(IMAGE_SIZE_OPTIONS)) {
      const sizeCard = sizeGrid.createDiv({ 
        cls: `grokidian-size-card ${this.selectedImageSize === size ? 'selected' : ''}`
      });
      
      sizeCard.createEl('span', { text: info.label, cls: 'grokidian-size-label' });
      sizeCard.createEl('span', { text: info.description, cls: 'grokidian-size-desc' });
      
      sizeCard.addEventListener('click', () => {
        sizeGrid.querySelectorAll('.grokidian-size-card').forEach(el => el.removeClass('selected'));
        sizeCard.addClass('selected');
        this.selectedImageSize = size as ImageSize;
      });
    }
  }

  private renderOptionsSection(container: HTMLElement) {
    const section = container.createDiv({ cls: 'grokidian-section' });
    section.createEl('h3', { text: 'Options' });

    new Setting(section)
      .setName('Aspect Ratio')
      .setDesc('Choose the shape of your images')
      .addDropdown(dropdown => {
        const ratios: Record<AspectRatio, string> = {
          '16:9': '16:9 (Widescreen)',
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
      .setDesc('Each image will have a unique AI-generated prompt')
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

  private renderButtonSection(container: HTMLElement) {
    const buttonContainer = container.createDiv({ cls: 'grokidian-button-container' });

    const generateBtn = buttonContainer.createEl('button', {
      text: 'Generate AI Prompts',
      cls: 'mod-cta'
    });
    generateBtn.addEventListener('click', () => {
      const style = STYLE_TEMPLATES.find(s => s.id === this.selectedStyle);
      this.onComplete({
        confirmed: true,
        style: this.selectedStyle,
        styleName: style?.name || 'Hyper-Realism',
        aspectRatio: this.selectedAspectRatio,
        imageCount: this.selectedImageCount,
        imageSize: this.selectedImageSize
      });
      this.close();
    });

    const cancelBtn = buttonContainer.createEl('button', {
      text: 'Cancel'
    });
    cancelBtn.addEventListener('click', () => {
      this.onComplete({
        confirmed: false,
        style: this.selectedStyle,
        styleName: '',
        aspectRatio: this.selectedAspectRatio,
        imageCount: this.selectedImageCount,
        imageSize: this.selectedImageSize
      });
      this.close();
    });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
