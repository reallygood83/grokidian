import { Editor, MarkdownView, Notice, App } from 'obsidian';
import { GrokidianSettings, UseCaseMatch, PlacementSuggestion } from '../api/types';
import { XAIClient } from '../api/xai-client';
import { ImageAPI } from '../api/image-api';
import { ContentAnalyzer } from '../services/content-analyzer';
import { UseCaseDetector } from '../services/use-case-detector';
import { AIPromptService } from '../services/ai-prompt-service';
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
  private smartPlacement: SmartPlacement;
  private storageManager: StorageManager;

  constructor(app: App, settings: GrokidianSettings) {
    this.app = app;
    this.settings = settings;
    this.contentAnalyzer = new ContentAnalyzer();
    this.useCaseDetector = new UseCaseDetector();
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
    const progressModal = new ProgressModal(this.app);
    progressModal.open();
    progressModal.setStatus('Analyzing note content with AI...');

    try {
      const concepts = this.contentAnalyzer.extractConcepts(content);
      const detectedUseCase = this.useCaseDetector.detectUseCase(content, concepts);
      
      const client = new XAIClient(this.settings.apiKey);
      const aiPromptService = new AIPromptService(client);
      
      progressModal.setStatus('AI is generating optimized prompts...');
      
      const aiResult = await aiPromptService.generatePromptsFromNote(
        content,
        this.settings.defaultImageCount,
        this.settings.defaultStyle,
        this.settings.defaultUseCase
      );

      progressModal.close();

      const initialPrompt = aiResult.prompts.join('\n\n---\n\n');

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
            aiResult.prompts,
            editor,
            view,
            forceManual
          );
        }
      );
      
      modal.open();

    } catch (error) {
      progressModal.close();
      new Notice(`Error analyzing content: ${(error as Error).message}`);
    }
  }

  private async generateAndInsertImages(
    content: string,
    noteTitle: string,
    options: ImageGenOptions,
    aiPrompts: string[],
    editor: Editor,
    view: MarkdownView,
    forceManual: boolean
  ): Promise<void> {
    const progressModal = new ProgressModal(this.app);
    progressModal.open();

    try {
      const totalSteps = options.imageCount + 2;
      progressModal.updateProgress(0, totalSteps, 'Starting image generation...');

      const client = new XAIClient(this.settings.apiKey);
      const imageApi = new ImageAPI(client);
      
      const savedPaths: string[] = [];
      const promptsToUse = this.getPromptsToUse(options, aiPrompts);

      for (let i = 0; i < options.imageCount; i++) {
        if (progressModal.isOperationCancelled()) {
          progressModal.close();
          return;
        }

        progressModal.updateProgress(i + 1, totalSteps, `Generating image ${i + 1} of ${options.imageCount}...`);

        const prompt = promptsToUse[i] || promptsToUse[0];
        
        const images = await imageApi.generateImages({
          prompt,
          count: 1,
          aspectRatio: options.aspectRatio
        });

        if (images.length > 0) {
          const image = images[0];
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
        }
      }

      progressModal.updateProgress(totalSteps - 1, totalSteps, 'Finalizing...');
      progressModal.close();

      if (savedPaths.length === 0) {
        new Notice('No images were generated');
        return;
      }

      await this.insertImages(
        savedPaths,
        content,
        promptsToUse[0],
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

  private getPromptsToUse(options: ImageGenOptions, aiPrompts: string[]): string[] {
    const userPrompt = options.generatedPrompt.trim();
    
    if (userPrompt.includes('---')) {
      return userPrompt.split('---').map(p => p.trim()).filter(p => p.length > 0);
    }
    
    if (userPrompt !== aiPrompts.join('\n\n---\n\n')) {
      return [userPrompt];
    }
    
    return aiPrompts;
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
