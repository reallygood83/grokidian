import { Editor, MarkdownView, Notice, App } from 'obsidian';
import { GrokidianSettings, UseCaseMatch, PlacementSuggestion } from '../api/types';
import { XAIClient } from '../api/xai-client';
import { ImageAPI, GeneratedImage } from '../api/image-api';
import { ContentAnalyzer } from '../services/content-analyzer';
import { UseCaseDetector } from '../services/use-case-detector';
import { PromptGenerator } from '../services/prompt-generator';
import { SmartPlacement } from '../services/smart-placement';
import { StorageManager } from '../services/storage-manager';
import { ImageGenModal, ImageGenOptions } from '../ui/modals/ImageGenModal';
import { SmartPlacementModal, PlacementResult } from '../ui/modals/SmartPlacementModal';
import { ProgressModal } from '../ui/modals/ProgressModal';

export class GenerateCommand {
  private app: App;
  private settings: GrokidianSettings;
  private contentAnalyzer: ContentAnalyzer;
  private useCaseDetector: UseCaseDetector;
  private promptGenerator: PromptGenerator;
  private smartPlacement: SmartPlacement;
  private storageManager: StorageManager;

  constructor(app: App, settings: GrokidianSettings) {
    this.app = app;
    this.settings = settings;
    this.contentAnalyzer = new ContentAnalyzer();
    this.useCaseDetector = new UseCaseDetector();
    this.promptGenerator = new PromptGenerator();
    this.smartPlacement = new SmartPlacement();
    this.storageManager = new StorageManager(app);
  }

  updateSettings(settings: GrokidianSettings) {
    this.settings = settings;
  }

  async executeAuto(editor: Editor, view: MarkdownView): Promise<void> {
    if (!this.validateApiKey()) return;

    const content = editor.getValue();
    const noteTitle = view.file?.basename || 'untitled';
    
    await this.runGeneration(content, noteTitle, editor, view);
  }

  async executeFromSelection(editor: Editor, view: MarkdownView): Promise<void> {
    if (!this.validateApiKey()) return;

    const selection = editor.getSelection();
    if (!selection || selection.trim().length === 0) {
      new Notice('Please select some text first');
      return;
    }

    const noteTitle = view.file?.basename || 'untitled';
    await this.runGeneration(selection, noteTitle, editor, view);
  }

  async executeManual(editor: Editor, view: MarkdownView): Promise<void> {
    if (!this.validateApiKey()) return;

    const content = editor.getValue();
    const noteTitle = view.file?.basename || 'untitled';
    
    await this.runGeneration(content, noteTitle, editor, view, true);
  }

  private validateApiKey(): boolean {
    if (!this.settings.apiKey) {
      new Notice('Please configure your xAI API key in Grokidian settings');
      return false;
    }
    return true;
  }

  private async runGeneration(
    content: string,
    noteTitle: string,
    editor: Editor,
    view: MarkdownView,
    forceManual: boolean = false
  ): Promise<void> {
    const concepts = this.contentAnalyzer.extractConcepts(content);
    const detectedUseCase = this.useCaseDetector.detectUseCase(content, concepts);
    
    const initialPrompt = this.promptGenerator.generateAutoPrompt(
      concepts,
      this.settings.defaultUseCase,
      this.settings.defaultStyle,
      detectedUseCase.template
    );

    const modal = new ImageGenModal(
      this.app,
      this.settings,
      concepts,
      detectedUseCase,
      initialPrompt,
      async (options: ImageGenOptions) => {
        if (!options.confirmed) return;
        
        await this.generateAndInsertImages(
          content,
          noteTitle,
          options,
          editor,
          view,
          forceManual
        );
      }
    );
    
    modal.open();
  }

  private async generateAndInsertImages(
    content: string,
    noteTitle: string,
    options: ImageGenOptions,
    editor: Editor,
    view: MarkdownView,
    forceManual: boolean
  ): Promise<void> {
    const progressModal = new ProgressModal(this.app);
    progressModal.open();

    try {
      progressModal.updateProgress(0, options.imageCount + 1, 'Generating images...');

      const client = new XAIClient(this.settings.apiKey);
      const imageApi = new ImageAPI(client);
      
      const images = await imageApi.generateImages({
        prompt: options.generatedPrompt,
        count: options.imageCount,
        aspectRatio: options.aspectRatio
      });

      if (progressModal.isOperationCancelled()) {
        progressModal.close();
        return;
      }

      progressModal.updateProgress(1, options.imageCount + 1, 'Saving images...');

      const savedPaths: string[] = [];
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        
        if (progressModal.isOperationCancelled()) {
          progressModal.close();
          return;
        }

        let imagePath: string;
        if (image.url) {
          imagePath = await this.storageManager.saveImageFromUrl(
            image.url,
            noteTitle,
            options.style,
            i,
            this.settings
          );
        } else if (image.base64) {
          imagePath = await this.storageManager.saveImageFromBase64(
            image.base64,
            noteTitle,
            options.style,
            i,
            this.settings
          );
        } else {
          continue;
        }

        savedPaths.push(imagePath);
        progressModal.updateProgress(i + 2, options.imageCount + 1, `Saved image ${i + 1}`);
      }

      progressModal.close();

      if (savedPaths.length === 0) {
        new Notice('No images were generated');
        return;
      }

      await this.insertImages(
        savedPaths,
        content,
        options.generatedPrompt,
        editor,
        view,
        forceManual
      );

      new Notice(`Generated ${savedPaths.length} image(s) successfully!`);

    } catch (error) {
      progressModal.close();
      new Notice(`Error: ${(error as Error).message}`);
    }
  }

  private async insertImages(
    imagePaths: string[],
    noteContent: string,
    prompt: string,
    editor: Editor,
    view: MarkdownView,
    forceManual: boolean
  ): Promise<void> {
    const insertionMode = forceManual ? 'manual' : this.settings.insertionMode;

    if (insertionMode === 'manual') {
      this.insertAtCursor(imagePaths, editor);
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
              this.insertAtCursor(imagePaths, editor);
            } else {
              this.insertWithPlacements(imagePaths, result.selectedPlacements, editor);
            }
          }
        );
        placementModal.open();
        return;
      }
    }

    this.insertAtCursor(imagePaths, editor);
  }

  private insertAtCursor(imagePaths: string[], editor: Editor): void {
    const imageLinks = imagePaths
      .map(path => this.storageManager.generateWikiImageLink(path))
      .join('\n\n');
    
    const cursor = editor.getCursor();
    editor.replaceRange('\n\n' + imageLinks + '\n\n', cursor);
  }

  private insertWithPlacements(
    imagePaths: string[],
    placements: Map<number, PlacementSuggestion>,
    editor: Editor
  ): void {
    const sortedInsertions: { line: number; content: string }[] = [];
    
    for (let i = 0; i < imagePaths.length; i++) {
      const placement = placements.get(i);
      const imageLink = this.storageManager.generateWikiImageLink(imagePaths[i]);
      
      if (placement) {
        const line = placement.location.position === 'after'
          ? placement.location.lineNumber
          : placement.location.lineNumber - 1;
        sortedInsertions.push({ line, content: imageLink });
      } else {
        const cursor = editor.getCursor();
        sortedInsertions.push({ line: cursor.line, content: imageLink });
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
}
