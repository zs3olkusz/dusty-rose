import { js } from './highlighters/js';

export class Editor {
  el: HTMLElement;
  highlight: (el: any) => void;
  tab: string;

  constructor(
    el: HTMLElement,
    highlight: (el: any) => void = js,
    tab: string = '    '
  ) {
    this.el = el;
    this.highlight = highlight;
    this.tab = tab;

    this.highlight(this.el);

    this.el.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.which === 9) {
        const pos = this.caret() + tab.length;
        const range = window.getSelection().getRangeAt(0);

        range.deleteContents();
        range.insertNode(document.createTextNode(tab));

        this.highlight(el);
        this.setCaret(pos);

        e.preventDefault();
      }
    });

    this.el.addEventListener('keyup', (e: KeyboardEvent) => {
      if (e.keyCode >= 0x30 || e.keyCode == 0x20) {
        const pos = this.caret();

        this.highlight(el);
        this.setCaret(pos);
      }
    });
  }

  caret() {
    const range = window.getSelection().getRangeAt(0);
    const prefix = range.cloneRange();

    prefix.selectNodeContents(this.el);
    prefix.setEnd(range.endContainer, range.endOffset);

    return prefix.toString().length;
  }

  setCaret(pos: number, parent: any = this.el) {
    for (const node of parent.childNodes) {
      if (node.nodeType == Node.TEXT_NODE) {
        if (node.length >= pos) {
          const range = document.createRange();
          const sel = window.getSelection();

          range.setStart(node, pos);
          range.collapse(true);

          sel.removeAllRanges();
          sel.addRange(range);

          return -1;
        } else {
          pos = pos - node.length;
        }
      } else {
        pos = this.setCaret(pos, node);

        if (pos < 0) {
          return pos;
        }
      }
    }
    return pos;
  }
}
