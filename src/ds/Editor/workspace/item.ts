import { convertWindowsPathToUnixPath, getBasePath } from '../../utils';
import { addChild, openFolder } from '../core/state';

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
      openFolder(this.path, this.path);

      this._explore(this.path);
    } else {
      const parentPath = getBasePath(this.path);

      addChild({
        path: this.path,
        isFile: this.isFile,
        isDirectory: this.isDirectory,
        basePath: this.basePath,
        isExpanded: this.isExpanded,
        isRoot: this.isRoot,
        parent: parentPath,
        childs: [],
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
