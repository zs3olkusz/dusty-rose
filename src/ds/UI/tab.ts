import { Editor } from '../Editor/editor';
import { convertWindowsPathToUnixPath, getBaseName } from '../utils/files';

let dragSrcEl: HTMLElement = null;

export class Tab {
  path: string;
  fileName: string;
  fileContent: string;

  editor: Editor;

  tab: HTMLElement;

  constructor(editor: Editor, path: string) {
    this.editor = editor;

    this.path = path;

    this.fileName = this.path
      ? getBaseName(convertWindowsPathToUnixPath(this.path))
      : 'Untitled';
    this.fileContent = this.path ? window.ds.read(path) : '';

    this.tab = this._createTab();

    document.getElementById('tabs').appendChild(this.tab);

    this.openTab();
  }

  public openTab(): void {
    this.editor.setContent(this.fileContent);
    this._toggleOffOtherTabs();
    this.tab.classList.add('active');
    this.editor.el.focus();
  }

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

  public removeTab(e: MouseEvent): void {
    // @ts-ignore
    e.target.parentNode.parentElement.removeChild(e.target.parentNode);

    this.editor.tabs.filter((tab) => tab !== this);
  }

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
