import { App, Modal } from 'obsidian';

export class ProgressModal extends Modal {
  private progressBar: HTMLDivElement;
  private statusText: HTMLDivElement;
  private currentStep: number = 0;
  private totalSteps: number = 1;
  private isCancelled: boolean = false;
  private onCancel?: () => void;

  constructor(app: App, onCancel?: () => void) {
    super(app);
    this.onCancel = onCancel;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.addClass('grokidian-progress-modal');

    contentEl.createEl('h2', { text: 'Generating Images...' });

    const progressContainer = contentEl.createDiv({ cls: 'grokidian-progress-container' });
    
    this.progressBar = progressContainer.createDiv({ cls: 'grokidian-progress-bar' });
    this.progressBar.createDiv({ cls: 'grokidian-progress-fill' });

    this.statusText = contentEl.createDiv({ cls: 'grokidian-status-text' });
    this.statusText.setText('Initializing...');

    const cancelBtn = contentEl.createEl('button', { 
      text: 'Cancel',
      cls: 'grokidian-cancel-btn'
    });
    cancelBtn.addEventListener('click', () => {
      this.isCancelled = true;
      this.onCancel?.();
      this.close();
    });
  }

  updateProgress(current: number, total: number, status: string) {
    this.currentStep = current;
    this.totalSteps = total;
    
    const percentage = Math.round((current / total) * 100);
    const fill = this.progressBar.querySelector('.grokidian-progress-fill') as HTMLDivElement;
    if (fill) {
      fill.style.width = `${percentage}%`;
    }
    
    this.statusText.setText(`${status} (${current}/${total})`);
  }

  setStatus(status: string) {
    this.statusText.setText(status);
  }

  isOperationCancelled(): boolean {
    return this.isCancelled;
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
