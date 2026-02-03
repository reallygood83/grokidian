import { App, TFile, TFolder, normalizePath, requestUrl, Platform } from 'obsidian';
import { GrokidianSettings } from '../api/types';
import { IMAGE_FILE_PREFIX } from '../constants/config';

declare global {
  interface Window {
    require: (module: string) => any;
  }
}

export class StorageManager {
  private app: App;

  constructor(app: App) {
    this.app = app;
  }

  async saveImageFromUrl(
    imageUrl: string,
    noteTitle: string,
    style: string,
    index: number,
    settings: GrokidianSettings
  ): Promise<string> {
    const response = await requestUrl({ url: imageUrl });
    const arrayBuffer = response.arrayBuffer;
    
    const filename = this.generateFilename(noteTitle, style, index, settings);
    
    if (settings.storageLocation === 'external' && settings.externalFolderPath) {
      return this.saveToExternalFolder(arrayBuffer, filename, settings);
    }
    
    const folderPath = this.getAttachmentPath(settings);
    await this.ensureFolderExists(folderPath);
    const fullPath = normalizePath(`${folderPath}/${filename}`);
    await this.app.vault.createBinary(fullPath, arrayBuffer);
    
    return fullPath;
  }

  async saveImageFromBase64(
    base64Data: string,
    noteTitle: string,
    style: string,
    index: number,
    settings: GrokidianSettings
  ): Promise<string> {
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const filename = this.generateFilename(noteTitle, style, index, settings);
    
    if (settings.storageLocation === 'external' && settings.externalFolderPath) {
      return this.saveToExternalFolder(bytes.buffer, filename, settings);
    }
    
    const folderPath = this.getAttachmentPath(settings);
    await this.ensureFolderExists(folderPath);
    const fullPath = normalizePath(`${folderPath}/${filename}`);
    await this.app.vault.createBinary(fullPath, bytes.buffer);
    
    return fullPath;
  }

  private async saveToExternalFolder(
    data: ArrayBuffer,
    filename: string,
    settings: GrokidianSettings
  ): Promise<string> {
    if (!Platform.isDesktopApp) {
      throw new Error('External folder storage is only available on desktop');
    }

    const fs = window.require('fs');
    const nodePath = window.require('path');
    
    let folderPath = settings.externalFolderPath
      .trim()
      .replace(/^['"]|['"]$/g, '')
      .replace(/^["']|["']$/g, '');
    
    if (settings.createMonthlySubfolders) {
      const now = new Date();
      const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      folderPath = nodePath.join(folderPath, yearMonth);
    }
    
    try {
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
    } catch (mkdirError: any) {
      throw new Error(`Failed to create folder: ${folderPath}\n${mkdirError.message}`);
    }
    
    const fullPath = nodePath.join(folderPath, filename);
    const buffer = Buffer.from(data);
    
    try {
      fs.writeFileSync(fullPath, buffer);
    } catch (writeError: any) {
      throw new Error(`Failed to write file: ${fullPath}\n${writeError.message}`);
    }
    
    return `file://${fullPath}`;
  }

  getAttachmentPath(settings: GrokidianSettings): string {
    if (settings.storageLocation === 'vault_custom' && settings.customStoragePath) {
      let path = settings.customStoragePath;
      
      if (settings.createMonthlySubfolders) {
        const now = new Date();
        const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        path = `${path}/${yearMonth}`;
      }
      
      return normalizePath(path);
    }
    
    const obsidianConfig = this.readObsidianAttachmentSettings();
    let basePath = obsidianConfig.attachmentFolderPath || '';
    
    if (settings.createMonthlySubfolders) {
      const now = new Date();
      const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      basePath = basePath ? `${basePath}/${yearMonth}` : yearMonth;
    }
    
    return normalizePath(basePath);
  }

  readObsidianAttachmentSettings(): { attachmentFolderPath: string; useRelativePath: boolean } {
    const config = (this.app.vault as any).config;
    
    return {
      attachmentFolderPath: config?.attachmentFolderPath || '',
      useRelativePath: config?.useRelativePath || false
    };
  }

  generateFilename(
    noteTitle: string,
    style: string,
    index: number,
    settings: GrokidianSettings
  ): string {
    const sanitizedTitle = this.sanitizeFilename(noteTitle);
    const sanitizedStyle = this.sanitizeFilename(style);
    
    let filename = `${IMAGE_FILE_PREFIX}_${sanitizedTitle}_${sanitizedStyle}_${index + 1}`;
    
    if (settings.includeTimestampInFilename) {
      const now = new Date();
      const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
      filename = `${filename}_${timestamp}`;
    }
    
    return `${filename}.png`;
  }

  async ensureFolderExists(folderPath: string): Promise<void> {
    if (!folderPath) return;
    
    const normalizedPath = normalizePath(folderPath);
    const folder = this.app.vault.getAbstractFileByPath(normalizedPath);
    
    if (!folder) {
      await this.app.vault.createFolder(normalizedPath);
    }
  }

  private sanitizeFilename(name: string): string {
    return name
      .replace(/[\\/:*?"<>|]/g, '_')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .substring(0, 50)
      .replace(/^_+|_+$/g, '');
  }

  generateMarkdownImageLink(imagePath: string, altText?: string): string {
    const filename = imagePath.split('/').pop() || imagePath;
    const alt = altText || filename.replace(/\.[^/.]+$/, '');
    
    if (imagePath.startsWith('file://')) {
      return `![${alt}](${imagePath})`;
    }
    
    return `![${alt}](${imagePath})`;
  }

  generateWikiImageLink(imagePath: string): string {
    if (imagePath.startsWith('file://')) {
      const filename = imagePath.split('/').pop() || imagePath;
      const alt = filename.replace(/\.[^/.]+$/, '');
      return `![${alt}](${imagePath})`;
    }
    
    const filename = imagePath.split('/').pop() || imagePath;
    return `![[${filename}]]`;
  }
  
  isExternalPath(imagePath: string): boolean {
    return imagePath.startsWith('file://');
  }

  async deleteImage(imagePath: string): Promise<void> {
    const file = this.app.vault.getAbstractFileByPath(imagePath);
    if (file instanceof TFile) {
      await this.app.vault.delete(file);
    }
  }
}
