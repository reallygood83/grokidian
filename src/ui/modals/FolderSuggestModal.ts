import { App, FuzzySuggestModal, TFolder } from 'obsidian';

export class FolderSuggestModal extends FuzzySuggestModal<TFolder> {
  private onSelect: (folder: TFolder) => void;

  constructor(app: App, onSelect: (folder: TFolder) => void) {
    super(app);
    this.onSelect = onSelect;
    this.setPlaceholder('Type to search folders...');
  }

  getItems(): TFolder[] {
    const folders: TFolder[] = [];
    const root = this.app.vault.getRoot();
    folders.push(root);
    
    this.app.vault.getAllLoadedFiles().forEach(file => {
      if (file instanceof TFolder && file.path !== '/') {
        folders.push(file);
      }
    });
    
    folders.sort((a, b) => a.path.localeCompare(b.path));
    return folders;
  }

  getItemText(folder: TFolder): string {
    return folder.path === '/' ? '/ (Vault Root)' : folder.path;
  }

  onChooseItem(folder: TFolder, evt: MouseEvent | KeyboardEvent): void {
    this.onSelect(folder);
  }
}
