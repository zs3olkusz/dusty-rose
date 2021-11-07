import { FileExplorer } from './fileExplorer';

const explorerEl = document.getElementById('explorer');

export class WorkSpace {
  paths: {
    [path: string]: FileExplorer;
  };

  constructor() {
    this.paths = {};

    explorerEl.addEventListener('drop', (e) => {
      e.stopPropagation();
      e.preventDefault();

      // get the file from the event data and loop through them
      const items = e.dataTransfer.items;
      for (let i = 0; i < items.length; i++) {
        const item = items[i].webkitGetAsEntry();

        // if the item is a directory then we open it
        if (item && item.isDirectory) {
          // open folder
          this.open(items[i].getAsFile().path);
        }
      }

      explorerEl.classList.remove('drag-over');
    });

    explorerEl.addEventListener('dragover', (e: DragEvent) => {
      e.preventDefault();
    });

    explorerEl.addEventListener('dragenter', () =>
      explorerEl.classList.add('drag-over')
    );

    explorerEl.addEventListener('dragleave', () =>
      explorerEl.classList.remove('drag-over')
    );
  }

  /** Open path */
  public open(path: string) {
    this.paths[path] = new FileExplorer(path);
  }
}
