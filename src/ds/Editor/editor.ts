import { TabsManager } from './tabs/manager';
import { getLineEndings, LineEnding } from '../utils/files';
import { textToHtml, htmlToText } from './core/text';
import { WorkSpace } from './workspace';

const ignoredKeys = [
  'Alt',
  'AltGraph',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'CapsLock',
  'Control',
  'End',
  'Enter',
  'Escape',
  'F1',
  'F2',
  'F3',
  'F4',
  'F5',
  'F6',
  'F7',
  'F8',
  'F9',
  'F10',
  'F11',
  'F12',
  'Home',
  'Insert',
  'Meta',
  'NumLock',
  'PageDown',
  'PageUp',
  'Pause',
  'PrintScreen',
  'Shift',
];

export class Editor {
  tabsManager: TabsManager;
  workspace: WorkSpace;

  constructor(public readonly el: HTMLElement) {
    this.tabsManager = new TabsManager(this);

    this.workspace = new WorkSpace('F:/Projects/learning-css');

    this.el.addEventListener('keyup', (e: KeyboardEvent) => {
      // prevent deleting last line in editor
      if (this.el.childNodes.length === 0) {
        this.el.innerHTML = '<div><br></div>';
      }

      if (ignoredKeys.indexOf(e.key) === -1) {
        const pos = this.tabsManager.openedTab.caret.getCaretPos();

        if (
          this.tabsManager.openedTab &&
          this.tabsManager.openedTab.highlight
        ) {
          this.tabsManager.openedTab.highlight.highlight();
        }
        this.tabsManager.openedTab.caret.setCaretPos(pos);

        this.tabsManager.openedTab.fileContent = htmlToText(this.el).join(
          getLineEndings() === LineEnding.CRLF ? '\r\n' : '\n'
        );
      }
    });

    this.el.addEventListener('drop', (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const path = e.dataTransfer.getData('text');
      if (path) {
        this.setContent(window.ds.read(path));
        this.tabsManager.newTab(path);

        e.dataTransfer.clearData();
      }

      const files = e.dataTransfer.files;
      for (let index = 0; index < files.length; index++) {
        const element = files[index];
        const fileContent = window.ds.read(element.path);

        if (fileContent !== null) {
          this.setContent(fileContent);
          this.tabsManager.newTab(element.path);
        }
      }

      this.el.classList.remove('drag-over');
    });

    this.el.addEventListener('dragover', (e: DragEvent) => {
      e.preventDefault();
    });

    this.el.addEventListener('dragenter', () =>
      this.el.classList.add('drag-over')
    );

    this.el.addEventListener('dragleave', () =>
      this.el.classList.remove('drag-over')
    );

    this.el.addEventListener('paste', (e: ClipboardEvent) => {
      e.preventDefault();

      const data = e.clipboardData.getData('text/plain');

      this.setContent(data);
    });

    // on editor creation create tab
    this.tabsManager.newTab();

    this.el.focus();

    window.ds.on('ds:newFile', () => this.tabsManager.newTab());
    window.ds.on('ds:openFile', () => console.error('Not implemented'));
    window.ds.on('ds:openFolder', () => console.error('Not implemented'));
    window.ds.on('ds:save', () => this.saveFile());
    window.ds.on('ds:saveAs', () => this.saveFile());
    window.ds.on('ds:saveAll', () => console.error('Not implemented'));
  }

  public saveFile(): void {
    const path = window.ds.write(
      this.tabsManager.openedTab.path,
      htmlToText(this.el).join(
        getLineEndings() === LineEnding.CRLF ? '\r\n' : '\n'
      )
    );

    if (path && !this.tabsManager.openedTab.path) {
      this.tabsManager.openedTab.setPath(path);
    }
  }

  public setContent(content: string): void {
    this.el.innerHTML = textToHtml(content);

    if (this.tabsManager.openedTab && this.tabsManager.openedTab.highlight) {
      this.tabsManager.openedTab.highlight.highlight();
    }
  }
}
