import { Dusty } from '../../../types';
import { convertWindowsPathToUnixPath, getBaseName } from '../../utils/files';
import { emit, openFolder } from '../core/state';
import { getContextMenuOptions } from './contextMenu';
import { Item } from './item';

export class FileExplorer {
  tree: Item;

  constructor(path: string) {
    path = convertWindowsPathToUnixPath(path);

    if (!window.ds.explore(path)) return;

    // create new tree for file explorer in state
    window.state.workspace[path] = {
      tree: {},
    };

    this.tree = new Item(path, false, true, path, true, true);

    this._init();

    // update state
    openFolder(this.tree.path);
  }

  /** Initialize explorer */
  _init(): void {
    // render file explorer tree in DOM
    this._renderFileExplorer();

    const togglers = document.getElementsByClassName('caret');

    // add event listener to toggle folder's open/close
    for (let i = 0; i < togglers.length; i++) {
      togglers[i].addEventListener('click', function () {
        this.parentElement.querySelector('.nested').classList.toggle('active');
        this.classList.toggle('caret-down');

        this.dataset.isExpanded === 'true'
          ? (this.dataset.isExpanded = 'false')
          : (this.dataset.isExpanded = 'true');
      });
    }

    // initialize context menu
    this._initContextMenu();
  }

  /** Create a new tree for file explorer */
  private _renderFileExplorer(): void {
    const dir = document.querySelector('.dir');

    dir.innerHTML = '';
    dir.appendChild(this._createElement(this.tree));
  }

  /** Create a context menu for file explorer in DOM */
  private _renderContextMenu(
    actions: Dusty.ContextMenuAction[],
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

  /** Initializes a context menu for file explorer */
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

        // renders context menu with actions corresponding to item's type
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

  /** Expands folder in file tree */
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
        isDirectory,
        this.tree.path
      );
    });

    this._init();
  }

  /** Creates a new element for file explorer */
  private _createElement(item: Item): HTMLElement {
    const el = document.createElement('li');

    el.dataset.path = item.path;
    el.dataset.isFile = item.isFile === true ? 'true' : 'false';
    el.dataset.isDirectory = item.isDirectory === true ? 'true' : 'false';

    el.title = item.path;

    // get base name of item's path
    const name = getBaseName(convertWindowsPathToUnixPath(item.path));

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

      // on double click, open file in new tab
      el.addEventListener('dblclick', () => {
        if (
          window.state.tabManagers[window.state.editors.activeEditor]
            .openedTab === item.path
        ) {
          emit(
            'ds:tabManager-tab-active',
            window.state.editors.activeEditor,
            item.path
          );
        } else {
          emit(
            'ds:tabManager-add',
            window.state.editors.activeEditor,
            item.path
          );
        }
      });
    }

    // add drag support for files and folders
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
