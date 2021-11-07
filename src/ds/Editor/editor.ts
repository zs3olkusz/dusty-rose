import { TabsManager } from './tabs/manager';
import { getLineEndings, LineEnding } from '../utils/files';
import { textToHtml, htmlToText } from './core/text';
import { WorkSpace } from './workspace';
import { Tab } from './tabs/tab';

/**
 * Ignored keys for the editor's highlight
 * so the highlight doesn't get runned when content is not being changed
 */
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
    // create tabs manager for the editor
    this.tabsManager = new TabsManager(this);

    // create workspace for the editor
    this.workspace = new WorkSpace();

    this.el.addEventListener('keyup', (e: KeyboardEvent) => {
      // prevent deleting last line in editor
      if (this.el.childNodes.length === 0) {
        this.el.innerHTML = '<div><br></div>';
      }

      // check if key is ignored
      if (ignoredKeys.indexOf(e.key) === -1) {
        // get caret position
        const pos = this.tabsManager.openedTab.caret.getCaretPos();

        // update code highlighting if tab is opened and code highlighting is enabled
        if (
          this.tabsManager.openedTab &&
          this.tabsManager.openedTab.highlight
        ) {
          this.tabsManager.openedTab.highlight.highlight();
        }
        // update caret position
        this.tabsManager.openedTab.caret.setCaretPos(pos);
      }

      // update caret position info
      this._updateCaretPos();

      // update tab content
      this._updateTabContent(this.tabsManager.openedTab);
    });

    this.el.addEventListener('keydown', (e: KeyboardEvent) => {
      // update caret position info
      this._updateCaretPos();

      // update tab content
      this._updateTabContent(this.tabsManager.openedTab);
    });

    this.el.addEventListener('click', (e: MouseEvent) => {
      e.stopPropagation();

      // update caret position info
      this._updateCaretPos();
    });

    this.el.addEventListener('drop', (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // get file path from drop event text data
      const path = e.dataTransfer.getData('text');
      if (path) {
        // open file
        this.setContent(window.ds.read(path));
        this.tabsManager.newTab(path);

        // clear drop event data
        e.dataTransfer.clearData();
      }

      // get file path from drop event files data and loop through them
      const files = e.dataTransfer.files;
      for (let index = 0; index < files.length; index++) {
        const element = files[index];
        const fileContent = window.ds.read(element.path);

        // open file and create new tab if it's exist
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

      // get pasted text
      const data = e.clipboardData.getData('text/plain');

      // set pasted text to the editor's content
      this.setContent(data);
    });

    // on editor creation create tab
    this.tabsManager.newTab();

    this.el.focus();

    // on event `ds:newFile` create new tab
    window.ds.on('ds:newFile', () => this.tabsManager.newTab());

    // on event `ds:openFile` open file via new tab
    window.ds.on('ds:openFile', () => {
      window.ds
        .open({
          properties: ['openFile', 'multiSelections'],
        })
        .map((path) => {
          this.tabsManager.newTab(path);
        });
    });

    // on event `ds:saveFolder` open folder in explorer
    window.ds.on('ds:openFolder', () => {
      window.ds
        .open({
          properties: ['openDirectory', 'multiSelections', 'createDirectory'],
        })
        .map((path) => {
          this.workspace.open(path);
        });
    });

    // on event `ds:saveFile` save file
    window.ds.on('ds:save', () => this.saveFile());

    // on event `ds:saveAsFile` save file as with dialog
    window.ds.on('ds:saveAs', () => this.saveFile());

    // on event `ds:saveAll` save all opened files
    window.ds.on('ds:saveAll', () => {
      const tabs = this.tabsManager.tabs;

      Object.keys(tabs).map((path) => {
        if (path) {
          this.saveFile(tabs[path]);
        }
      });
    });
  }

  /** Update caret position info */
  private _updateCaretPos(): void {
    const { line, column } = this._getCaretPos();

    cursorPosEl.innerHTML = `Ln ${line}, Col ${column}`;
  }

  /** Get caret position */
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

  /** Save file */
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

  /** Update tab content */
  private _updateTabContent(tab: Tab): void {
    tab.fileContent = htmlToText(this.el).join(
      getLineEndings() === LineEnding.CRLF ? '\r\n' : '\n'
    );
  }

  /** Set content of the editor */
  public setContent(content: string): void {
    this.el.innerHTML = textToHtml(content);

    // highlight code if it's enabled and tab is opened
    if (this.tabsManager.openedTab && this.tabsManager.openedTab.highlight) {
      this.tabsManager.openedTab.highlight.highlight();
    }
  }
}
