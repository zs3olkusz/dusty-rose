import { Caret } from '../core/caret';
import { Editor } from '../editor';
import { convertWindowsPathToUnixPath, getBaseName } from '../../utils/files';
import { escapeCharacters } from '../core/text';
import { Highlighter } from '../highlight';
import lang from '../highlight/languages/javascript.json';

let dragSrcEl: HTMLElement = null;

const spacesEl = document.getElementById('spaces');
const modeEl = document.getElementById('mode');

export class Tab {
  path: string;
  fileName: string;
  fileContent: string;

  editor: Editor;
  highlight: Highlighter;
  caret: Caret;

  tab: HTMLElement;

  constructor(editor: Editor, path: string, mode: any = null) {
    mode = lang;
    this.editor = editor;

    this.caret = new Caret(this.editor.el);

    if (mode) {
      this.highlight = new Highlighter(this.editor.el, mode);
      modeEl.textContent = 'In some kind mode';
    } else {
      this.highlight = null;
      modeEl.textContent = 'Text';
    }

    this.setPath(path);

    this.tab = this._createTab();

    document.getElementById('tabs').appendChild(this.tab);

    this.openTab();

    spacesEl.addEventListener('change', (e: any) => {
      this.caret.setTabWidth(e.target.value);
    });
  }

  /** Set tab path */
  public setPath(path: string): void {
    this.path = path;

    if (this.path) {
      // set tab name
      this.fileName = getBaseName(convertWindowsPathToUnixPath(this.path));

      // set tab content
      const content = window.ds.read(this.path);
      this.fileContent = content
        ? escapeCharacters(window.ds.read(this.path))
        : '';
    } else {
      this.fileName = 'Untitled';
      this.fileContent = '';
    }

    if (this.tab) {
      const tabContainer = document.getElementById('tabs');

      tabContainer.removeChild(this.tab);

      // create new tab element in DOM
      this.tab = this._createTab();

      tabContainer.appendChild(this.tab);
    }
  }

  /** Open tab */
  public openTab(): void {
    this.editor.setContent(this.fileContent);
    this._toggleOffOtherTabs();
    this.tab.classList.add('active');
    this.editor.el.focus();
    this.editor.tabsManager.openedTab = this;
  }

  /** Create tab element in DOM */
  private _createTab(): HTMLElement {
    const tab = document.createElement('li');
    tab.classList.add('tab');

    tab.setAttribute('draggable', 'true');

    tab.addEventListener('click', () => {
      if (this.tab.classList.contains('active')) return;

      this.openTab();
    });

    const fileType = document.createElement('span');
    fileType.classList.add('file__type');
    fileType.innerText = '🗋';

    tab.appendChild(fileType);
    tab.append(` ${this.fileName} `);

    const fileClose = document.createElement('span');
    fileClose.classList.add('file__close');
    fileClose.innerText = '⨯';
    fileClose.title = 'Close file';
    fileClose.addEventListener('click', this.removeTab);

    tab.appendChild(fileClose);

    tab.addEventListener('dragstart', this.handleDragStart);
    tab.addEventListener('dragenter', this.handleDragEnter);
    tab.addEventListener('dragover', this.handleDragOver);
    tab.addEventListener('dragleave', this.handleDragLeave);
    tab.addEventListener('drop', this.handleDrop);
    tab.addEventListener('dragend', this.handleDragEnd);

    return tab;
  }

  /** Remove tab */
  public removeTab(e: MouseEvent): void {
    // @ts-ignore
    e.target.parentNode.parentElement.removeChild(e.target.parentNode);

    this.editor.tabsManager.tabs[this.path] = null;
  }

  /** Toggle off all tabs */
  private _toggleOffOtherTabs(): void {
    const tabs = document.getElementById('tabs').children;

    for (let index = 0; index < tabs.length; index++) {
      tabs[index].classList.remove('active');
    }
  }

  handleDragStart(e: DragEvent): void {
    dragSrcEl = e.target as HTMLElement;

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', dragSrcEl.outerHTML);

    dragSrcEl.classList.add('dragElem');
  }

  handleDragOver = function (e: DragEvent): void {
    e.preventDefault?.();

    this.classList.add('over');
    e.dataTransfer.dropEffect = 'move';
  };

  handleDragEnter(e: DragEvent): void {
    e.preventDefault();
  }

  handleDragLeave = function (): void {
    this.classList.remove('over');
  };

  handleDrop = function (e: DragEvent): void {
    e.stopPropagation?.();

    if (dragSrcEl != this) {
      dragSrcEl.parentNode.removeChild(dragSrcEl);

      const dropHTML = e.dataTransfer.getData('text/html');

      this.insertAdjacentHTML('beforebegin', dropHTML);

      const dropElem = this.previousSibling;

      dropElem.addEventListener('dragstart', this.handleDragStart);
      dropElem.addEventListener('dragenter', this.handleDragEnter);
      dropElem.addEventListener('dragover', this.handleDragOver);
      dropElem.addEventListener('dragleave', this.handleDragLeave);
      dropElem.addEventListener('drop', this.handleDrop);
      dropElem.addEventListener('dragend', this.handleDragEnd);
      dropElem
        .querySelector('.file__close')
        .addEventListener('click', this.removeTab);
    }

    this.classList.remove('over');
  };

  handleDragEnd = function (): void {
    this.classList.remove('over');
  };
}
