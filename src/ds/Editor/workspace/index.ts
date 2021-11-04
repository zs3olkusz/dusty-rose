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

      const items = e.dataTransfer.items;

      for (let i = 0; i < items.length; i++) {
        // webkitGetAsEntry is where the magic happens
        const item = items[i].webkitGetAsEntry();

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

  // open path
  public open(path: string) {
    this.paths[path] = new FileExplorer(path);
  }
}
