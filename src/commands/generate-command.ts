import { Editor, MarkdownView, Notice, App } from 'obsidian';
import { GrokidianSettings, PlacementSuggestion } from '../api/types';
import { XAIClient } from '../api/xai-client';
import { ImageAPI } from '../api/image-api';
import { AIPromptService } from '../services/ai-prompt-service';
import { SmartPlacement } from '../services/smart-placement';
import { StorageManager } from '../services/storage-manager';
import { StyleSelectionModal, StyleSelectionResult, ImageSize } from '../ui/modals/StyleSelectionModal';
import { PromptReviewModal, PromptReviewResult } from '../ui/modals/PromptReviewModal';
import { SmartPlacementModal, PlacementResult } from '../ui/modals/SmartPlacementModal';
import { ProgressModal } from '../ui/modals/ProgressModal';

export class GenerateCommand {
  private app: App;
  private settings: GrokidianSettings;
  private smartPlacement: SmartPlacement;
  private storageManager: StorageManager;

  constructor(app: App, settings: GrokidianSettings) {
    this.app = app;
    this.settings = settings;
    this.smartPlacement = new SmartPlacement();
    this.storageManager = new StorageManager(app);
  }

  updateSettings(settings: GrokidianSettings) {
    this.settings = settings;
  }

  async executeAuto(editor: Editor, view: MarkdownView): Promise<void> {
    if (!this.validateApiKey()) return;

    const content = editor.getValue();
    if (!content || content.trim().length < 10) {
      new Notice('Please add some content to your note first');
      return;
    }

    const noteTitle = view.file?.basename || 'untitled';
    await this.startGenerationFlow(content, noteTitle, editor, view);
  }

  async executeFromSelection(editor: Editor, view: MarkdownView): Promise<void> {
    if (!this.validateApiKey()) return;

    const selection = editor.getSelection();
    if (!selection || selection.trim().length < 10) {
      new Notice('Please select more text (at least 10 characters)');
      return;
    }

    const noteTitle = view.file?.basename || 'untitled';
    await this.startGenerationFlow(selection, noteTitle, editor, view);
  }

  async executeManual(editor: Editor, view: MarkdownView): Promise<void> {
    await this.executeAuto(editor, view);
  }

  private validateApiKey(): boolean {
    if (!this.settings.apiKey) {
      new Notice('Please configure your xAI API key in Grokidian settings');
      return false;
    }
    return true;
  }

  private async startGenerationFlow(
    content: string,
    noteTitle: string,
    editor: Editor,
    view: MarkdownView
  ): Promise<void> {
    const styleModal = new StyleSelectionModal(
      this.app,
      async (styleResult: StyleSelectionResult) => {
        if (!styleResult.confirmed) return;
        
        await this.generatePrompts(content, noteTitle, styleResult, editor, view);
      }
    );
    
    styleModal.open();
  }

  private async generatePrompts(
    content: string,
    noteTitle: string,
    styleResult: StyleSelectionResult,
    editor: Editor,
    view: MarkdownView
  ): Promise<void> {
    const progressModal = new ProgressModal(this.app);
    progressModal.open();
    progressModal.setStatus('AI is analyzing your note content...');

    try {
      const client = new XAIClient(this.settings.apiKey);
      const aiPromptService = new AIPromptService(client);
      
      progressModal.setStatus(`Generating ${styleResult.imageCount} optimized prompts for ${styleResult.styleName} style...`);
      
      const aiResult = await aiPromptService.generatePromptsFromNote(
        content,
        styleResult.imageCount,
        styleResult.style
      );

      progressModal.close();

      if (aiResult.prompts.length === 0) {
        new Notice('Failed to generate prompts. Please try again.');
        return;
      }

      const promptModal = new PromptReviewModal(
        this.app,
        aiResult.prompts,
        styleResult.styleName,
        styleResult.imageCount,
        async (promptResult: PromptReviewResult) => {
          if (!promptResult.confirmed) {
            await this.startGenerationFlow(content, noteTitle, editor, view);
            return;
          }
          
          await this.generateImages(
            content,
            noteTitle,
            styleResult,
            promptResult.prompts,
            editor,
            view
          );
        }
      );
      
      promptModal.open();

    } catch (error) {
      progressModal.close();
      new Notice(`Error generating prompts: ${(error as Error).message}`);
    }
  }

  private async generateImages(
    content: string,
    noteTitle: string,
    styleResult: StyleSelectionResult,
    prompts: string[],
    editor: Editor,
    view: MarkdownView
  ): Promise<void> {
    const progressModal = new ProgressModal(this.app);
    progressModal.open();

    try {
      const client = new XAIClient(this.settings.apiKey);
      const imageApi = new ImageAPI(client);
      
      const savedPaths: string[] = [];
      const totalImages = prompts.length;

      for (let i = 0; i < totalImages; i++) {
        if (progressModal.isOperationCancelled()) {
          progressModal.close();
          if (savedPaths.length > 0) {
            new Notice(`Cancelled. Generated ${savedPaths.length} image(s) before cancellation.`);
          }
          return;
        }

        progressModal.updateProgress(i, totalImages, `Generating image ${i + 1} of ${totalImages}...`);

        const prompt = prompts[i];
        
        try {
          const images = await imageApi.generateImages({
            prompt,
            count: 1,
            aspectRatio: styleResult.aspectRatio
          });

          if (images.length > 0) {
            const image = images[0];
            progressModal.setStatus(`Saving image ${i + 1}...`);
            
            let imagePath: string;
            
            if (image.url) {
              imagePath = await this.storageManager.saveImageFromUrl(
                image.url,
                noteTitle,
                styleResult.style,
                i,
                this.settings
              );
            } else if (image.base64) {
              imagePath = await this.storageManager.saveImageFromBase64(
                image.base64,
                noteTitle,
                styleResult.style,
                i,
                this.settings
              );
            } else {
              continue;
            }

            savedPaths.push(imagePath);
          }
        } catch (imageError) {
          console.error(`Error generating image ${i + 1}:`, imageError);
          new Notice(`Warning: Failed to generate image ${i + 1}. Continuing...`);
        }
      }

      progressModal.close();

      if (savedPaths.length === 0) {
        new Notice('No images were generated. Please check your prompts and try again.');
        return;
      }

      await this.insertImages(
        savedPaths,
        content,
        prompts[0],
        styleResult.imageSize,
        editor,
        view
      );

      new Notice(`Successfully generated ${savedPaths.length} image(s)!`);

    } catch (error) {
      progressModal.close();
      new Notice(`Error: ${(error as Error).message}`);
    }
  }

  private async insertImages(
    imagePaths: string[],
    noteContent: string,
    prompt: string,
    imageSize: ImageSize,
    editor: Editor,
    view: MarkdownView
  ): Promise<void> {
    const insertionMode = this.settings.insertionMode;
    const sizeValue = this.getSizeValue(imageSize);

    if (insertionMode === 'manual') {
      this.insertAtCursor(imagePaths, sizeValue, editor);
      return;
    }

    if (insertionMode === 'ai_smart') {
      const suggestions = this.smartPlacement.analyzePlacementOptions(
        noteContent,
        prompt,
        imagePaths.length
      );

      if (suggestions.length > 0) {
        const placementModal = new SmartPlacementModal(
          this.app,
          suggestions,
          imagePaths.length,
          (result: PlacementResult) => {
            if (!result.accepted) return;

            if (result.useManual || result.selectedPlacements.size === 0) {
              this.insertAtCursor(imagePaths, sizeValue, editor);
            } else {
              this.insertWithPlacements(imagePaths, result.selectedPlacements, sizeValue, editor);
            }
          }
        );
        placementModal.open();
        return;
      }
    }

    this.insertAtCursor(imagePaths, sizeValue, editor);
  }

  private getSizeValue(size: ImageSize): number {
    const sizes: Record<ImageSize, number> = {
      'small': 256,
      'medium': 512,
      'large': 700,
      'extra-large': 1000
    };
    return sizes[size] || 700;
  }

  private insertAtCursor(imagePaths: string[], sizeValue: number, editor: Editor): void {
    const imageLinks = imagePaths
      .map(path => this.generateImageEmbed(path, sizeValue))
      .join('\n\n');
    
    const cursor = editor.getCursor();
    editor.replaceRange('\n\n' + imageLinks + '\n\n', cursor);
  }

  private insertWithPlacements(
    imagePaths: string[],
    placements: Map<number, PlacementSuggestion>,
    sizeValue: number,
    editor: Editor
  ): void {
    const sortedInsertions: { line: number; content: string }[] = [];
    
    for (let i = 0; i < imagePaths.length; i++) {
      const placement = placements.get(i);
      const imageEmbed = this.generateImageEmbed(imagePaths[i], sizeValue);
      
      if (placement) {
        const line = placement.location.position === 'after'
          ? placement.location.lineNumber
          : placement.location.lineNumber - 1;
        sortedInsertions.push({ line, content: imageEmbed });
      } else {
        const cursor = editor.getCursor();
        sortedInsertions.push({ line: cursor.line, content: imageEmbed });
      }
    }

    sortedInsertions.sort((a, b) => b.line - a.line);

    for (const insertion of sortedInsertions) {
      const lineContent = editor.getLine(insertion.line);
      editor.replaceRange(
        '\n\n' + insertion.content + '\n',
        { line: insertion.line, ch: lineContent.length }
      );
    }
  }

  private generateImageEmbed(imagePath: string, sizeValue: number): string {
    const filename = imagePath.split('/').pop() || imagePath;
    return `![[${filename}|${sizeValue}]]`;
  }
}
