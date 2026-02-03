import { App, PluginSettingTab, Setting, Notice, Platform } from 'obsidian';
import { GrokidianSettings, AspectRatio, InsertionMode, StorageLocation, DEFAULT_SETTINGS } from './api/types';
import { STYLE_TEMPLATES } from './constants/styles';
import { USE_CASE_TEMPLATES } from './constants/use-cases';
import { MIN_IMAGE_COUNT, MAX_IMAGE_COUNT } from './constants/config';
import { XAIClient } from './api/xai-client';
import { FolderSuggestModal } from './ui/modals/FolderSuggestModal';
import type GrokidianPlugin from './main';

declare global {
  interface Window {
    require: (module: string) => any;
  }
}

export class GrokidianSettingTab extends PluginSettingTab {
  plugin: GrokidianPlugin;

  constructor(app: App, plugin: GrokidianPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h1', { text: 'Grokidian Settings' });

    this.renderApiSection(containerEl);
    this.renderImageDefaultsSection(containerEl);
    this.renderStorageSection(containerEl);
  }

  private renderApiSection(container: HTMLElement) {
    container.createEl('h2', { text: 'API Configuration' });

    new Setting(container)
      .setName('xAI API Key')
      .setDesc('Enter your xAI API key. Get one at console.x.ai')
      .addText(text => {
        text
          .setPlaceholder('xai-...')
          .setValue(this.plugin.settings.apiKey)
          .onChange(async (value) => {
            this.plugin.settings.apiKey = value;
            await this.plugin.saveSettings();
          });
        text.inputEl.type = 'password';
        text.inputEl.style.width = '300px';
      });

    new Setting(container)
      .setName('Test Connection')
      .setDesc('Verify your API key is valid')
      .addButton(button => {
        button
          .setButtonText('Test API Key')
          .onClick(async () => {
            button.setDisabled(true);
            button.setButtonText('Testing...');
            
            try {
              const client = new XAIClient(this.plugin.settings.apiKey);
              const isValid = await client.validateApiKey();
              
              if (isValid) {
                new Notice('API Key is valid!');
              } else {
                new Notice('Invalid API Key. Please check and try again.');
              }
            } catch (error) {
              new Notice('Failed to validate API key. Check your connection.');
            }
            
            button.setDisabled(false);
            button.setButtonText('Test API Key');
          });
      });
  }

  private renderImageDefaultsSection(container: HTMLElement) {
    container.createEl('h2', { text: 'Image Generation Defaults' });

    new Setting(container)
      .setName('Default Style')
      .setDesc('Styles are ranked by quality: S (Best) > A > B > C')
      .addDropdown(dropdown => {
        for (const style of STYLE_TEMPLATES) {
          dropdown.addOption(style.id, `[${style.tier}] ${style.icon} ${style.name}`);
        }
        dropdown.setValue(this.plugin.settings.defaultStyle);
        dropdown.onChange(async (value) => {
          this.plugin.settings.defaultStyle = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(container)
      .setName('Default Use Case Template')
      .setDesc('Auto-detect analyzes your note to choose the best template')
      .addDropdown(dropdown => {
        dropdown.addOption('auto_detect', 'Auto-Detect (Recommended)');
        for (const template of USE_CASE_TEMPLATES) {
          dropdown.addOption(template.id, `${template.icon} ${template.name}`);
        }
        dropdown.setValue(this.plugin.settings.defaultUseCase);
        dropdown.onChange(async (value) => {
          this.plugin.settings.defaultUseCase = value as any;
          await this.plugin.saveSettings();
        });
      });

    new Setting(container)
      .setName('Default Aspect Ratio')
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
        dropdown.setValue(this.plugin.settings.defaultAspectRatio);
        dropdown.onChange(async (value) => {
          this.plugin.settings.defaultAspectRatio = value as AspectRatio;
          await this.plugin.saveSettings();
        });
      });

    new Setting(container)
      .setName('Default Number of Images')
      .setDesc(`Generate ${MIN_IMAGE_COUNT}-${MAX_IMAGE_COUNT} images per request`)
      .addSlider(slider => {
        slider
          .setLimits(MIN_IMAGE_COUNT, MAX_IMAGE_COUNT, 1)
          .setValue(this.plugin.settings.defaultImageCount)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.defaultImageCount = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(container)
      .setName('Insertion Mode')
      .setDesc('How images are inserted into your notes')
      .addDropdown(dropdown => {
        const modes: Record<InsertionMode, string> = {
          'ai_smart': 'AI Smart Placement (Recommended)',
          'manual': 'Manual (Insert at cursor)',
          'ask_each_time': 'Ask Each Time'
        };
        for (const [value, label] of Object.entries(modes)) {
          dropdown.addOption(value, label);
        }
        dropdown.setValue(this.plugin.settings.insertionMode);
        dropdown.onChange(async (value) => {
          this.plugin.settings.insertionMode = value as InsertionMode;
          await this.plugin.saveSettings();
        });
      });
  }

  private renderStorageSection(container: HTMLElement) {
    container.createEl('h2', { text: 'Storage Settings' });

    new Setting(container)
      .setName('Storage Location')
      .setDesc('Where to save generated images')
      .addDropdown(dropdown => {
        dropdown
          .addOption('obsidian', 'Obsidian Attachment Folder')
          .addOption('vault_custom', 'Custom Vault Folder')
          .addOption('external', 'External Folder (Outside Vault)')
          .setValue(this.plugin.settings.storageLocation)
          .onChange(async (value: StorageLocation) => {
            this.plugin.settings.storageLocation = value;
            this.plugin.settings.useObsidianAttachmentFolder = value === 'obsidian';
            await this.plugin.saveSettings();
            this.display();
          });
      });

    if (this.plugin.settings.storageLocation === 'vault_custom') {
      new Setting(container)
        .setName('Vault Folder Path')
        .setDesc('Folder inside your vault (e.g., "assets/grokidian")')
        .addText(text => {
          text
            .setPlaceholder('assets/grokidian')
            .setValue(this.plugin.settings.customStoragePath)
            .onChange(async (value) => {
              this.plugin.settings.customStoragePath = value;
              await this.plugin.saveSettings();
            });
          text.inputEl.style.width = '200px';
        })
        .addButton(button => {
          button
            .setButtonText('Browse')
            .onClick(() => {
              new FolderSuggestModal(this.app, async (folder) => {
                const path = folder.path === '/' ? '' : folder.path;
                this.plugin.settings.customStoragePath = path;
                await this.plugin.saveSettings();
                this.display();
              }).open();
            });
        });
    }

    if (this.plugin.settings.storageLocation === 'external') {
      new Setting(container)
        .setName('External Folder Path')
        .setDesc('Absolute path (e.g., "/Users/moon/Pictures/grokidian")')
        .addText(text => {
          text
            .setPlaceholder('/Users/you/Pictures/grokidian')
            .setValue(this.plugin.settings.externalFolderPath)
            .onChange(async (value) => {
              const cleanPath = value.trim().replace(/^['"]|['"]$/g, '');
              this.plugin.settings.externalFolderPath = cleanPath;
              await this.plugin.saveSettings();
            });
          text.inputEl.style.width = '280px';
        })
        .addButton(button => {
          button
            .setButtonText('Browse')
            .onClick(async () => {
              if (Platform.isDesktopApp) {
                const { remote } = window.require('@electron/remote') || window.require('electron');
                const dialog = remote?.dialog || window.require('electron').dialog;
                
                try {
                  const result = await dialog.showOpenDialog({
                    properties: ['openDirectory', 'createDirectory'],
                    title: 'Select Image Storage Folder'
                  });
                  
                  if (!result.canceled && result.filePaths.length > 0) {
                    this.plugin.settings.externalFolderPath = result.filePaths[0];
                    await this.plugin.saveSettings();
                    this.display();
                  }
                } catch (e) {
                  new Notice('Folder picker not available. Please type the path manually.');
                }
              } else {
                new Notice('Folder picker only available on desktop');
              }
            });
        });

      container.createEl('p', { 
        text: 'Note: Images in external folders will be linked using file:// URLs',
        cls: 'setting-item-description'
      });
    }

    new Setting(container)
      .setName('Create Monthly Subfolders')
      .setDesc('Organize images into YYYY-MM subfolders')
      .addToggle(toggle => {
        toggle
          .setValue(this.plugin.settings.createMonthlySubfolders)
          .onChange(async (value) => {
            this.plugin.settings.createMonthlySubfolders = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(container)
      .setName('Include Timestamp in Filename')
      .setDesc('Add timestamp to prevent filename conflicts')
      .addToggle(toggle => {
        toggle
          .setValue(this.plugin.settings.includeTimestampInFilename)
          .onChange(async (value) => {
            this.plugin.settings.includeTimestampInFilename = value;
            await this.plugin.saveSettings();
          });
      });
  }
}
