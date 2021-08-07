import { Tab } from '../UI/tab';
import { getLineEndings, LineEnding } from '../utils/files';
import { Caret } from './core/caret';
import { textToHtml, htmlToText } from './core/text';
import { Highlighter } from './highlight/highlighter';
import type { ILanguage } from './highlight/languages/language';

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
  highlight: Highlighter;
  caret: Caret;
  openedTab: Tab;
  tabs: Tab[];

  constructor(public el: HTMLElement, private _mode: ILanguage = null) {
    this.caret = new Caret(this.el);

    this.highlight = new Highlighter(this.el, this._mode);

    this.openedTab = null;
    this.tabs = [];

    this.el.addEventListener('keyup', (e: KeyboardEvent) => {
      // prevent deleting last line in editor
      if (this.el.childNodes.length === 0) {
        this.el.innerHTML = '<div><br></div>';
      }

      if (e.ctrlKey && e.key.toLowerCase() === 's' && this.openedTab) {
        this.saveFile();
        return;
      } else if (e.ctrlKey && e.key.toLowerCase() === 'n') {
        this.newTab();
        return;
      }

      if (ignoredKeys.indexOf(e.key) === -1 && this._mode) {
        const pos = this.caret.getCaretPos();

        this.highlight.highlight();
        this.caret.setCaretPos(pos);
      }
    });

    this.el.addEventListener('drop', (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();

      for (let index = 0; index < event.dataTransfer.files.length; index++) {
        const element = event.dataTransfer.files[index];

        this.setContent(window.ds.read(element.path));
        this.newTab(element.path);
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
    this.newTab();

    this.el.focus();
  }

  public saveFile(): void {
    window.ds.write(
      this.openedTab.path,
      htmlToText(this.el).join(
        getLineEndings() === LineEnding.CRLF ? '\r\n' : '\n'
      )
    );
  }

  public setMode(mode: ILanguage): void {
    this._mode = mode;

    this.highlight = new Highlighter(this.el, this._mode);
    this.highlight.highlight();
  }

  public setContent(content: string): void {
    this.el.innerHTML = textToHtml(content);
    this._mode && this.highlight.highlight();
  }

  public newTab(path: string = ''): void {
    this.openedTab = new Tab(this, path);
    this.tabs.push(this.openedTab);
  }
}
