import { Plugin, MarkdownView, Editor } from 'obsidian';
import { GrokidianSettings, DEFAULT_SETTINGS } from './api/types';
import { GrokidianSettingTab } from './settings';
import { GenerateCommand } from './commands/generate-command';

export default class GrokidianPlugin extends Plugin {
  settings: GrokidianSettings;
  private generateCommand: GenerateCommand;

  async onload() {
    await this.loadSettings();

    this.generateCommand = new GenerateCommand(this.app, this.settings);

    this.addCommand({
      id: 'generate-images-auto',
      name: 'Generate Images (AI Auto)',
      icon: 'image-plus',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.generateCommand.executeAuto(editor, view);
      }
    });

    this.addCommand({
      id: 'generate-images-from-selection',
      name: 'Generate Images from Selection',
      icon: 'image',
      editorCheckCallback: (checking: boolean, editor: Editor, view: MarkdownView) => {
        const selection = editor.getSelection();
        const hasSelection = selection !== null && selection.trim().length > 0;
        if (checking) {
          return hasSelection;
        }
        if (hasSelection) {
          this.generateCommand.executeFromSelection(editor, view);
        }
      }
    });

    this.addCommand({
      id: 'generate-images-manual',
      name: 'Generate Images (Manual Mode)',
      icon: 'settings',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.generateCommand.executeManual(editor, view);
      }
    });

    this.addCommand({
      id: 'open-settings',
      name: 'Open Settings',
      callback: () => {
        (this.app as any).setting.open();
        (this.app as any).setting.openTabById('grokidian');
      }
    });

    this.addSettingTab(new GrokidianSettingTab(this.app, this));

    this.addRibbonIcon('image-plus', 'Grokidian: Generate Images', () => {
      const view = this.app.workspace.getActiveViewOfType(MarkdownView);
      if (view) {
        this.generateCommand.executeAuto(view.editor, view);
      }
    });
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.generateCommand?.updateSettings(this.settings);
  }
}
