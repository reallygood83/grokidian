import { App, Modal, Setting } from 'obsidian';
import { PlacementSuggestion } from '../../api/types';

export interface PlacementResult {
  accepted: boolean;
  selectedPlacements: Map<number, PlacementSuggestion>;
  useManual: boolean;
}

export class SmartPlacementModal extends Modal {
  private suggestions: PlacementSuggestion[];
  private imageCount: number;
  private selectedPlacements: Map<number, PlacementSuggestion>;
  private onComplete: (result: PlacementResult) => void;

  constructor(
    app: App,
    suggestions: PlacementSuggestion[],
    imageCount: number,
    onComplete: (result: PlacementResult) => void
  ) {
    super(app);
    this.suggestions = suggestions;
    this.imageCount = imageCount;
    this.selectedPlacements = new Map();
    this.onComplete = onComplete;
    
    for (let i = 0; i < Math.min(imageCount, suggestions.length); i++) {
      this.selectedPlacements.set(i, suggestions[i]);
    }
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.addClass('grokidian-placement-modal');

    contentEl.createEl('h2', { text: 'AI Smart Placement Suggestions' });
    
    contentEl.createEl('p', { 
      text: `Generated ${this.imageCount} image(s). AI suggests the following placements:`,
      cls: 'grokidian-placement-description'
    });

    const suggestionsContainer = contentEl.createDiv({ cls: 'grokidian-suggestions-container' });

    for (let i = 0; i < Math.min(this.imageCount, this.suggestions.length); i++) {
      const suggestion = this.suggestions[i];
      this.createSuggestionCard(suggestionsContainer, suggestion, i);
    }

    if (this.suggestions.length === 0) {
      suggestionsContainer.createEl('p', {
        text: 'No suitable placement locations found. Images will be inserted at cursor position.',
        cls: 'grokidian-no-suggestions'
      });
    }

    const buttonContainer = contentEl.createDiv({ cls: 'grokidian-button-container' });

    const acceptBtn = buttonContainer.createEl('button', {
      text: 'Accept AI Suggestions',
      cls: 'mod-cta'
    });
    acceptBtn.addEventListener('click', () => {
      this.onComplete({
        accepted: true,
        selectedPlacements: this.selectedPlacements,
        useManual: false
      });
      this.close();
    });

    const manualBtn = buttonContainer.createEl('button', {
      text: 'Insert Manually'
    });
    manualBtn.addEventListener('click', () => {
      this.onComplete({
        accepted: true,
        selectedPlacements: new Map(),
        useManual: true
      });
      this.close();
    });

    const cancelBtn = buttonContainer.createEl('button', {
      text: 'Cancel'
    });
    cancelBtn.addEventListener('click', () => {
      this.onComplete({
        accepted: false,
        selectedPlacements: new Map(),
        useManual: false
      });
      this.close();
    });
  }

  private createSuggestionCard(
    container: HTMLElement,
    suggestion: PlacementSuggestion,
    imageIndex: number
  ) {
    const card = container.createDiv({ cls: 'grokidian-suggestion-card' });
    
    const header = card.createDiv({ cls: 'grokidian-suggestion-header' });
    header.createEl('span', { 
      text: `Image ${imageIndex + 1}`,
      cls: 'grokidian-image-label'
    });
    header.createEl('span', {
      text: `${suggestion.score}% match`,
      cls: `grokidian-score ${suggestion.score >= 80 ? 'high' : suggestion.score >= 70 ? 'medium' : 'low'}`
    });

    card.createEl('div', {
      text: suggestion.reasoning,
      cls: 'grokidian-suggestion-reasoning'
    });

    const locationInfo = card.createDiv({ cls: 'grokidian-location-info' });
    locationInfo.createEl('span', {
      text: `Line ${suggestion.location.lineNumber}, ${suggestion.location.position} `,
      cls: 'grokidian-location-line'
    });
    locationInfo.createEl('code', {
      text: suggestion.location.anchor.substring(0, 40) + (suggestion.location.anchor.length > 40 ? '...' : ''),
      cls: 'grokidian-location-anchor'
    });

    const preview = card.createEl('pre', { cls: 'grokidian-context-preview' });
    preview.createEl('code', { text: suggestion.contextPreview });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
