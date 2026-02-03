import { App, Modal } from 'obsidian';

export interface PromptReviewResult {
  confirmed: boolean;
  prompts: string[];
}

export class PromptReviewModal extends Modal {
  private prompts: string[];
  private styleName: string;
  private imageCount: number;
  private onComplete: (result: PromptReviewResult) => void;
  private editedPrompts: string[];
  private textareas: HTMLTextAreaElement[] = [];

  constructor(
    app: App,
    prompts: string[],
    styleName: string,
    imageCount: number,
    onComplete: (result: PromptReviewResult) => void
  ) {
    super(app);
    this.prompts = prompts;
    this.styleName = styleName;
    this.imageCount = imageCount;
    this.onComplete = onComplete;
    this.editedPrompts = [...prompts];
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.addClass('grokidian-prompt-review-modal');
    contentEl.empty();

    const headerDiv = contentEl.createDiv({ cls: 'grokidian-prompt-header' });
    headerDiv.createEl('h2', { text: 'Review AI-Generated Prompts' });
    headerDiv.createEl('span', { text: 'Powered by Grok AI', cls: 'grokidian-ai-badge' });

    contentEl.createEl('p', {
      text: `${this.imageCount} unique prompt(s) generated for "${this.styleName}" style. Review and edit as needed.`,
      cls: 'grokidian-prompt-subtitle'
    });

    const promptsContainer = contentEl.createDiv({ cls: 'grokidian-prompts-container' });
    
    for (let i = 0; i < this.editedPrompts.length; i++) {
      this.renderPromptCard(promptsContainer, i);
    }

    this.renderButtonSection(contentEl);
  }

  private renderPromptCard(container: HTMLElement, index: number) {
    const card = container.createDiv({ cls: 'grokidian-prompt-card' });
    
    const cardHeader = card.createDiv({ cls: 'grokidian-prompt-card-header' });
    cardHeader.createEl('span', { 
      text: `Image ${index + 1}`,
      cls: 'grokidian-prompt-number'
    });
    
    const charCount = cardHeader.createEl('span', { cls: 'grokidian-char-count' });
    charCount.setText(`${this.editedPrompts[index].length} chars`);

    const textarea = card.createEl('textarea', {
      cls: 'grokidian-prompt-textarea-single'
    });
    textarea.value = this.editedPrompts[index];
    textarea.rows = 4;
    textarea.addEventListener('input', (e) => {
      const value = (e.target as HTMLTextAreaElement).value;
      this.editedPrompts[index] = value;
      charCount.setText(`${value.length} chars`);
    });
    
    this.textareas.push(textarea);

    const actionsDiv = card.createDiv({ cls: 'grokidian-prompt-actions' });
    
    const regenerateBtn = actionsDiv.createEl('button', {
      text: 'Reset',
      cls: 'grokidian-prompt-action-btn'
    });
    regenerateBtn.addEventListener('click', () => {
      this.editedPrompts[index] = this.prompts[index];
      textarea.value = this.prompts[index];
      charCount.setText(`${this.prompts[index].length} chars`);
    });

    const copyBtn = actionsDiv.createEl('button', {
      text: 'Copy',
      cls: 'grokidian-prompt-action-btn'
    });
    copyBtn.addEventListener('click', async () => {
      await navigator.clipboard.writeText(this.editedPrompts[index]);
      copyBtn.setText('Copied!');
      setTimeout(() => copyBtn.setText('Copy'), 1500);
    });
  }

  private renderButtonSection(container: HTMLElement) {
    const buttonContainer = container.createDiv({ cls: 'grokidian-button-container' });

    const generateBtn = buttonContainer.createEl('button', {
      text: `Generate ${this.imageCount} Image${this.imageCount > 1 ? 's' : ''}`,
      cls: 'mod-cta'
    });
    generateBtn.addEventListener('click', () => {
      this.onComplete({
        confirmed: true,
        prompts: this.editedPrompts
      });
      this.close();
    });

    const backBtn = buttonContainer.createEl('button', {
      text: 'Back to Settings'
    });
    backBtn.addEventListener('click', () => {
      this.onComplete({
        confirmed: false,
        prompts: this.editedPrompts
      });
      this.close();
    });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
    this.textareas = [];
  }
}
