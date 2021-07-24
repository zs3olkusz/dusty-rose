import type {
  IExpandedAction,
  ILanguage,
  IShortAction,
} from './languages/language';
import { Tokenizer } from './tokenizer';
import type { IParsed } from './tokenizer';

interface ILine {
  classNames: string;
  text: string;
}

export class Highlighter {
  el: HTMLElement;
  mode: ILanguage | null;
  tokenizer: Tokenizer;

  private _parsedMode: IParsed[];

  private _prevState: string;
  private _currState: string;
  private _primState: string;

  constructor(el: HTMLElement, mode: ILanguage | null = null) {
    this.el = el;

    if (mode) {
      this.setMode(mode);

      this._prevState = null;
      this._currState = null;
      this._primState = null;
    }
  }

  public setMode(mode: ILanguage): void {
    this.mode = mode;

    this.tokenizer = new Tokenizer(this.mode);
    this._parsedMode = this.tokenizer.parseMode();
    this.highlight();
  }

  public highlight(): void {
    const codeLines: string[] = this._getEditorContent();

    console.log(codeLines);

    let html = '';

    codeLines.forEach((line: string) => {
      const tokenizedLine = this._tokenizeLine(line);

      html += '<div>';

      const text = tokenizedLine.text || '';
      const className = tokenizedLine.classNames || '';

      if (className) {
        html += `<span class="${className || ''}">${text}</span>`;
      } else {
        html += text;
      }

      html += '<br></div>';
    });

    if (!html) html = '<div><br></div>';

    this.el.innerHTML = html;
  }

  private _setState(state: string): void {
    if (!this._primState) {
      this._primState = state;
    }

    this._prevState = this._currState;
    this._currState = state;
  }

  private _getTokenClass(
    action: IShortAction | IExpandedAction
  ): string | null {
    if (typeof action === 'string') return action;
    return action.token || null;
  }

  private _getClassNamesFromToken(token: string): string {
    let className = '';

    token = token && token.startsWith('@') ? token.split('@')[1] : token;

    switch (token) {
      case 'white':
      case 'delimiter':
      case 'delimiter.bracket':
      case 'brackets':
        className = 'm1';
        break;

      // case 'type':
      //   className = '';
      //   break;

      // case 'type.indentifier':
      //   className = '';
      //   break;

      // case 'identifier':
      //   className = '';
      //   break;

      case 'tag':
      case 'regexp':
        className = 'm14';
        break;

      // case 'regexp.escape':
      //   className = '';
      //   break;

      // case 'regexp.escape.control':
      //   className = '';
      //   break;

      // case 'regexp.invalid':
      //   className = '';
      //   break;

      case 'keyword':
        className = 'm6';
        break;

      case 'keyword.other':
        className = 'm1';
        break;

      case 'comment':
        className = 'm8';
        break;

      case 'comment.doc':
      case 'string':
      case 'string.escape':
        className = 'm20';
        break;

      // case 'string.escape.invalid':
      //   className = '';
      //   break;

      // case 'string.invalid':
      //   className = '';
      //   break;

      case 'number':
      case 'number.float':
      case 'number.octal':
      case 'number.binary':
        className = 'm7';
        break;

      case 'number.hex':
        className = 'm16';
        break;

      // case '':
      //   className = '';
      //   break;

      default:
        className = 'm1';
        break;
    }

    return className;
  }

  private _tokenizeLine(line: string): ILine {
    let parsedLine: ILine = {
      classNames: 'm1',
      text: line,
    };

    this._parsedMode.forEach((parsed) => {
      const match = parsedLine.text.match(parsed.regex);

      if (match) {
        if (parsed.action) {
          const tokenClass = this._getTokenClass(
            parsed.action as IShortAction | IExpandedAction
          );

          parsedLine.classNames = this._getClassNamesFromToken(tokenClass);
        } else if (this._currState) {
          parsedLine.classNames = this._getClassNamesFromToken(this._currState);
        } else {
        }
      }
    });

    return parsedLine;
  }

  private _getEditorContent(): string[] {
    const content: string[] = [];

    const childrens = this.el.children;

    for (let index = 0; index < childrens.length; index++) {
      content.push(childrens[index].textContent);
    }

    return content;
  }
}
