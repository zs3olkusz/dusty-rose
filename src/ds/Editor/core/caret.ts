export class Caret {
  private readonly _editor: HTMLElement;

  tab: string = '    ';

  constructor(editor: HTMLElement) {
    this._editor = editor;

    this._editor.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        const pos = this.getCaretPos() + this.tab.length;
        const range = window.getSelection().getRangeAt(0);

        range.deleteContents();
        range.insertNode(document.createTextNode(this.tab));

        this.setCaretPos(pos);

        e.preventDefault();
      }
    });
  }

  /** Set tab width */
  public setTabWidth(value: string): void {
    this.tab = value;
  }

  /** Get caret current position */
  public getCaretPos(): number {
    const range = window.getSelection().getRangeAt(0);
    const prefix = range.cloneRange();

    prefix.selectNodeContents(this._editor);
    prefix.setEnd(range.endContainer, range.endOffset);

    return prefix.toString().length;
  }

  /** Set caret position */
  public setCaretPos(pos: number, parent: ChildNode = this._editor): number {
    parent.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent.length >= pos) {
          const range = document.createRange();
          const sel = window.getSelection();

          range.setStart(node, pos);
          range.collapse(true);

          sel.removeAllRanges();
          sel.addRange(range);

          return -1;
        } else {
          pos = pos - node.textContent.length;
        }
      } else {
        pos = this.setCaretPos(pos, node);

        if (pos < 0) {
          return pos;
        }
      }
    });

    return pos;
  }
}
