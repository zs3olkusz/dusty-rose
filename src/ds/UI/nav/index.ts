import { Editor } from '../../Editor/editor';
import { convertWindowsPathToUnixPath, getBaseName } from '../../utils/files';

export class Tab {
  fileName: string;
  fileContent: string;

  editor: Editor;

  tab: HTMLElement;

  constructor(editor: Editor, path: string) {
    this.editor = editor;

    this.fileName = getBaseName(convertWindowsPathToUnixPath(path));
    this.fileContent = window.ds.read(path);

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

    return tab;
  }

  public removeTab = function (e: MouseEvent): void {
    this.parentNode.parentElement.removeChild(this.parentNode);
  };

  private _toggleOffOtherTabs(): void {
    const tabs = document.getElementById('tabs').children;

    for (let index = 0; index < tabs.length; index++) {
      tabs[index].classList.remove('active');
    }
  }
}
