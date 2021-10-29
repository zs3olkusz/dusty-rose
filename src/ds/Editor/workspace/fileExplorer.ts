import { getBaseName } from '../../utils/files';
import { Dialog } from '../core/dialog';

interface IContextMenuAction {
  name: string;
  handler: (e: MouseEvent) => void;
}

function getContextMenuOptions({
  isFile,
  isDirectory,
  path,
}: {
  isFile: boolean;
  isDirectory: boolean;
  path: string;
}): IContextMenuAction[] {
  if (!isFile && isDirectory) {
    return [
      {
        name: 'Create folder',
        handler: () => {
          new Dialog({
            label: "Folder's name:",
            callback: (folderName: string) => {
              if (folderName) {
                window.ds.mkdir(`${path}/${folderName}`);
              }
            },
            placeholder: 'example',
            inputAttrs: {
              type: 'text',
              required: 'true',
            },
            type: 'input',
          });
        },
      },
      {
        name: 'Create file',
        handler: () => {
          new Dialog({
            label: "File's name:",
            callback: (fileName: string) => {
              if (fileName) {
                window.ds.write(`${path}/${fileName}`, '');
              }
            },
            placeholder: 'example',
            inputAttrs: {
              type: 'text',
              required: 'true',
            },
            type: 'input',
          });
        },
      },
      {
        name: 'Rename',
        handler: (e: MouseEvent) => {
          new Dialog({
            label: "Folder's new name:",
            callback: (newName: string) => {
              if (newName) {
                const basePath = path.split(getBaseName(path))[0];
                const newPath = `${basePath}/${newName}`;

                window.ds.rename(path, newPath);

                (e.target as HTMLElement).dataset.path = newPath;
              }
            },
            placeholder: 'example',
            inputAttrs: {
              type: 'text',
              required: 'true',
            },
            type: 'input',
          });
        },
      },
      {
        name: 'Delete',
        handler: () => {
          window.ds.delete(path, false);
        },
      },
    ];
  }
  return [
    {
      name: 'Rename',
      handler: (e: MouseEvent) => {
        new Dialog({
          label: "File's new name:",
          callback: (newName: string) => {
            if (newName) {
              const basePath = path.split(getBaseName(path))[0];
              const newPath = `${basePath}/${newName}`;

              window.ds.rename(path, newPath);

              (e.target as HTMLElement).dataset.path = newPath;
            }
          },
          placeholder: 'example',
          inputAttrs: {
            type: 'text',
            required: 'true',
          },
          type: 'input',
        });
      },
    },
    {
      name: 'Delete',
      handler: () => {
        window.ds.delete(path, true);
      },
    },
  ];
}

class Item {
  path: string;
  isDirectory: boolean;
  isFile: boolean;
  isExpanded: boolean;
  childrens: {
    [path: string]: Item;
  };

  constructor(
    path: string,
    isFile = true,
    isDirectory = false,
    isExpanded = false,
    readonly isRoot = false
  ) {
    this.path = path;
    this.isDirectory = isDirectory;
    this.isFile = isFile;
    this.isExpanded = isExpanded;

    this.childrens = {};

    this.isRoot && this._explore(this.path);
  }

  private _explore(path: string): void {
    if (!this.isFile && this.isDirectory) {
      const result = window.ds.explore(path);

      result.map(({ name, isDirectory, isFile }) => {
        this.childrens[name] = new Item(`${path}/${name}`, isFile, isDirectory);
      });
    }
  }
}

export class FileExplorer {
  tree: Item;

  constructor(path: string) {
    if (!window.ds.explore(path)) return;

    this.tree = new Item(path, false, true, true, true);

    this._init();
  }

  _init(): void {
    this._renderFileExplorer();

    const togglers = document.getElementsByClassName('caret');

    for (let i = 0; i < togglers.length; i++) {
      togglers[i].addEventListener('click', function () {
        this.parentElement.querySelector('.nested').classList.toggle('active');
        this.classList.toggle('caret-down');

        this.dataset.isExpanded === 'true'
          ? (this.dataset.isExpanded = 'false')
          : (this.dataset.isExpanded = 'true');
      });
    }

    this._initContextMenu();
  }

  private _renderFileExplorer(): void {
    const dir = document.querySelector('.dir');

    dir.innerHTML = '';
    dir.appendChild(this._createElement(this.tree));
  }

  private _renderContextMenu(
    actions: IContextMenuAction[],
    context: HTMLElement
  ): void {
    context.innerHTML = '';

    actions.forEach((action) => {
      const menuItem = document.createElement('div');
      menuItem.innerHTML = action.name;
      menuItem.addEventListener('click', (e: MouseEvent) => {
        action.handler(e);
        this._init();
      });

      context.appendChild(menuItem);
    });
  }

  private _initContextMenu(): void {
    const context = document.getElementById('context');
    const explorerItems = document.querySelectorAll('.dir li');

    explorerItems.forEach((item) => {
      item.addEventListener('contextmenu', (e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        const path = (item as HTMLElement).dataset.path;
        const isFile = (item as HTMLElement).dataset.isFile === 'true';
        const isDirectory =
          (item as HTMLElement).dataset.isDirectory === 'true';

        this._renderContextMenu(
          getContextMenuOptions({ isFile, isDirectory, path }),
          context
        );

        // position menu at the right-click cursor
        context.style.left = e.clientX + 'px';
        context.style.top = e.clientY + 'px';
        context.classList.add('show');
      });
    });

    document.addEventListener('click', (e) => {
      e.preventDefault();

      context.classList.remove('show');
    });
  }

  private _expandFolder(e: MouseEvent, item: Item): void {
    if (
      Object.keys(item.childrens).length > 0 ||
      (e.target as HTMLElement).dataset.isExpanded === 'true'
    )
      return;

    const result = window.ds.explore(item.path);

    item.isExpanded = true;

    result.map(({ name, isDirectory, isFile }) => {
      item.childrens[name] = new Item(
        `${item.path}/${name}`,
        isFile,
        isDirectory
      );
    });

    this._init();
  }

  private _createElement(item: Item): HTMLElement {
    const el = document.createElement('li');

    el.dataset.path = item.path;
    el.dataset.isFile = item.isFile === true ? 'true' : 'false';
    el.dataset.isDirectory = item.isDirectory === true ? 'true' : 'false';

    const name = getBaseName(item.path);

    if (item.isDirectory) {
      const span = document.createElement('span');
      span.classList.add('caret');

      if (item.isRoot || item.isExpanded) {
        span.classList.add('caret-down');
      }

      span.textContent = name;

      span.dataset.path = item.path;
      span.dataset.isFile = 'false';
      span.dataset.isDirectory = 'true';
      span.dataset.isExpanded = 'false';

      el.addEventListener('click', (e: MouseEvent) => {
        this._expandFolder(e, item);
      });

      if (!item.isRoot) {
        el.addEventListener('drop', (e: DragEvent) => {
          e.preventDefault();
          e.stopPropagation();

          const path = e.dataTransfer.getData('text');
          if (path) {
            const newPath = `${item.path}/${getBaseName(path)}`;

            window.ds.rename(path, newPath);

            e.dataTransfer.clearData();
          }

          this._expandFolder(e, item);
          this._init();

          el.classList.remove('drag-over');
        });

        el.addEventListener('dragover', (e: DragEvent) => {
          e.preventDefault();
        });

        el.addEventListener('dragenter', () => el.classList.add('drag-over'));

        el.addEventListener('dragleave', () =>
          el.classList.remove('drag-over')
        );
      }

      el.appendChild(span);

      const ul = document.createElement('ul');
      ul.classList.add('nested');

      if (item.isRoot || item.isExpanded) {
        ul.classList.add('active');
      }

      for (const name in item.childrens) {
        ul.appendChild(this._createElement(item.childrens[name]));
      }

      el.appendChild(ul);
    } else {
      el.textContent = name;
    }

    if (!item.isRoot) {
      el.draggable = true;

      el.addEventListener('dragstart', (e: DragEvent) => {
        e.dataTransfer.setData(
          'text/plain',
          (e.target as HTMLElement).dataset.path
        );
      });
    }

    return el;
  }
}
