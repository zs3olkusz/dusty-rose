import { convertWindowsPathToUnixPath, getBasePath } from '../../utils';
import { addFile, openFolder } from '../core/state';

/** Item class for file explorer items */
export class Item {
  public childrens: {
    [path: string]: Item;
  };

  constructor(
    public path: string,
    public isFile = true,
    public isDirectory = false,
    public basePath: string,
    public isExpanded = false,
    public readonly isRoot = false
  ) {
    this.path = convertWindowsPathToUnixPath(path);
    this.basePath = convertWindowsPathToUnixPath(basePath);

    this.childrens = {};

    if (this.isRoot) {
      this._explore(this.path);
    }

    if (this.isDirectory) {
      openFolder(this.path, !isRoot ? this.path : undefined);
    } else {
      addFile(this.path, {
        path: this.path,
        isFile: true,
        isDirectory: false,
        basePath: this.basePath,
        isExpanded: false,
        isRoot: false,
        parent: getBasePath(this.path),
        children: [],
      });
    }
  }

  /** Explore the directory and create childrens */
  private _explore(path: string): void {
    if (!this.isFile && this.isDirectory) {
      const result = window.ds.explore(path);

      result.map(({ name, isDirectory, isFile }) => {
        this.childrens[name] = new Item(
          `${path}/${name}`,
          isFile,
          isDirectory,
          this.basePath
        );
      });
    }
  }
}
