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

      if (
        e.ctrlKey &&
        e.key.toLowerCase() === 's' &&
        this.tabsManager.openedTab
      ) {
        this.saveFile();
        return;
      } else if (e.ctrlKey && e.key.toLowerCase() === 'n') {
        this.tabsManager.newTab();
        return;
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

      const files = e.dataTransfer.files;
      for (let index = 0; index < files.length; index++) {
        const element = files[index];

        this.setContent(window.ds.read(element.path));
        this.tabsManager.newTab(element.path);
      }

      this.el.classList.remove('drag-over');
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
  }

  public saveFile(): void {
    const res = window.ds.write(
      this.tabsManager.openedTab.path,
      htmlToText(this.el).join(
        getLineEndings() === LineEnding.CRLF ? '\r\n' : '\n'
      )
    );

    if (res.status === 'Success!' && !this.tabsManager.openedTab.path) {
      this.tabsManager.openedTab.setPath(res.path);
    }
  }

  public setContent(content: string): void {
    this.el.innerHTML = textToHtml(content);

    if (this.tabsManager.openedTab && this.tabsManager.openedTab.highlight) {
      this.tabsManager.openedTab.highlight.highlight();
    }
  }
}
