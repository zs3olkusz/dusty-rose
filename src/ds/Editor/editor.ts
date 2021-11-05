import { TabsManager } from './tabs/manager';
import { getLineEndings, LineEnding } from '../utils/files';
import { textToHtml, htmlToText } from './core/text';
import { WorkSpace } from './workspace';
import { Tab } from './tabs/tab';

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

const cursorPosEl = document.getElementById('cursorPos');

export class Editor {
  tabsManager: TabsManager;
  workspace: WorkSpace;

  constructor(public readonly el: HTMLElement) {
    this.tabsManager = new TabsManager(this);
    this.workspace = new WorkSpace();

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

      this._updateCaretPos();
      this._updateTabContent(this.tabsManager.openedTab);
    });

    this.el.addEventListener('keydown', (e: KeyboardEvent) => {
      this._updateCaretPos();
      this._updateTabContent(this.tabsManager.openedTab);
    });

    this.el.addEventListener('click', (e: MouseEvent) => {
      e.stopPropagation();
      this._updateCaretPos();
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
    window.ds.on('ds:openFile', () => {
      window.ds
        .open({
          properties: ['openFile', 'multiSelections'],
        })
        .map((path) => {
          this.tabsManager.newTab(path);
        });
    });
    window.ds.on('ds:openFolder', () => {
      window.ds
        .open({
          properties: ['openDirectory', 'multiSelections', 'createDirectory'],
        })
        .map((path) => {
          this.workspace.open(path);
        });
    });
    window.ds.on('ds:save', () => this.saveFile());
    window.ds.on('ds:saveAs', () => this.saveFile());
    window.ds.on('ds:saveAll', () => {
      const tabs = this.tabsManager.tabs;

      Object.keys(tabs).map((path) => {
        if (path) {
          this.saveFile(tabs[path]);
        }
      });
    });
  }

  // update caret position info
  private _updateCaretPos(): void {
    const { line, column } = this._getCaretPos();

    cursorPosEl.innerHTML = `Ln ${line}, Col ${column}`;
  }

  // get caret position
  private _getCaretPos(): { line: number; column: number } {
    const node = window.getSelection().anchorNode;

    const lines = this.el.childNodes;

    let line = 0;
    const column = window.getSelection().anchorOffset + 1;

    for (let i = 0; i < lines.length; i++) {
      const element = lines[i];

      if (element.nodeName === 'DIV' || element.nodeName === 'BR') {
        line++;
      }

      // turning off typescript check because of `childNodes` type
      // @ts-ignore
      if (element === node || [...element.childNodes].indexOf(node) !== -1) {
        return {
          line,
          column,
        };
      }
    }

    return {
      line,
      column,
    };
  }

  public saveFile(tab?: Tab): void {
    if (tab) {
      window.ds.write(tab.path, tab.fileContent);
    } else {
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
  }

  // update tab content
  private _updateTabContent(tab: Tab): void {
    tab.fileContent = htmlToText(this.el).join(
      getLineEndings() === LineEnding.CRLF ? '\r\n' : '\n'
    );
  }

  public setContent(content: string): void {
    this.el.innerHTML = textToHtml(content);

    if (this.tabsManager.openedTab && this.tabsManager.openedTab.highlight) {
      this.tabsManager.openedTab.highlight.highlight();
    }
  }
}
