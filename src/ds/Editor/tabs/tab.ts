import { Caret } from '../core/caret';
import { convertWindowsPathToUnixPath, getBaseName } from '../../utils/files';
import { escapeCharacters } from '../core/text';
import { Highlighter } from '../highlight';
import lang from '../highlight/languages/javascript.json';
import {
  addTab,
  emit,
  listen,
  removeTabFromEditor,
  setActiveTab,
} from '../core/state';
import { Dusty } from '../../../types';

let dragSrcEl: HTMLElement = null;

const spacesEl = document.getElementById('spaces');
const modeEl = document.getElementById('mode');

export class Tab {
  path: string;
  fileName: string;
  fileContent: string;

  highlight: Highlighter;
  caret: Caret;

  tab: HTMLElement;

  constructor(readonly editorId: string, path: string, mode: any = null) {
    mode = lang;

    const el = window.state.editors[this.editorId].element;

    this.caret = new Caret(el);

    if (mode) {
      this.highlight = new Highlighter(el, mode);
      modeEl.textContent = 'In some kind mode';
    } else {
      this.highlight = null;
      modeEl.textContent = 'Text';
    }

    this.setPath(path);

    // update state
    addTab({
      path: this.path,
      fileName: this.fileName,
      fileContent: this.fileContent,

      isChanged: false,
      isSaved: true,

      caret: this.caret.getCaretPosInfo(),
      highlightMode: mode,
    });

    this.tab = this._createTab();

    document.getElementById('tabs').appendChild(this.tab);

    this.openTab();

    spacesEl.addEventListener('change', (e: any) => {
      this.caret.setTabWidth(e.target.value);
    });

    listen(
      'ds:tab-changed',
      (editorId: string, data: Partial<Dusty.TabState>) => {
        if (editorId !== this.editorId || data.path !== this.path) return;

        this.setPath(data.path);
        data.fileContent && (this.fileContent = data.fileContent);
        data.highlightMode &&
          (this.highlight = new Highlighter(el, data.highlightMode));
      }
    );

    listen('ds:tabManager-tab-active', (editorId: string, path: string) => {
      if (editorId !== this.editorId || path !== this.path) return;

      this.setActive();
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

  /** Set tab as active */
  public setActive(): void {
    this._toggleOffOtherTabs();
    this.tab.classList.add('active');

    window.state.editors[this.editorId].element.focus();
  }

  /** Open tab */
  public openTab(): void {
    this.setActive();

    setActiveTab(this.editorId, this.path);
    emit('ds:tabManager-tab-active', this.editorId, this.path);
  }

  /** Create tab element in DOM */
  private _createTab(): HTMLElement {
    const tab = document.createElement('li');
    tab.classList.add('tab');

    tab.dataset.path = this.path;
    tab.dataset.editorId = this.editorId;

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
    fileClose.addEventListener('click', (e) =>
      this.removeTab(e, this.editorId, this.path)
    );

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
  public removeTab(e: MouseEvent, editorId: string, path: string): void {
    // @ts-ignore
    e.target.parentNode.parentElement.removeChild(e.target.parentNode);

    removeTabFromEditor(editorId, path);
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

      const dataset = (e.target as HTMLElement).dataset;

      dropElem
        .querySelector('.file__close')
        .addEventListener('click', (e: MouseEvent) => {
          this.removeTab(e, dataset.editorId, dataset.path);
          // @ts-ignore
          e.target.parentNode.parentElement.removeChild(e.target.parentNode);

          removeTabFromEditor(dataset.editorId, dataset.path);
        });
    }

    this.classList.remove('over');
  };

  handleDragEnd = function (): void {
    this.classList.remove('over');
  };
}
