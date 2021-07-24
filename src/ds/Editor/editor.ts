import { Caret } from './core/caret';
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
  el: HTMLElement;
  highlight: Highlighter;
  mode: ILanguage;
  caret: Caret;

  constructor(el: HTMLElement, mode: ILanguage = null) {
    this.el = el;

    this.caret = new Caret(this.el);

    this.mode = mode;

    this.highlight = new Highlighter(this.el, this.mode);

    this.el.addEventListener('keyup', (e: KeyboardEvent) => {
      // prevent deleting last line in editor
      if (this.el.childNodes.length === 0) {
        this.el.innerHTML = '<div><br></div>';
      }

      if (ignoredKeys.indexOf(e.key) === -1) {
        const pos = this.caret.getCaretPos();

        this.highlight.highlight();
        this.caret.setCaretPos(pos);

        return false;
      }
    });
  }
}
