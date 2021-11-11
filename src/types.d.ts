// Type definitions for Dusty Rose - v0.1.0

export declare namespace Dusty {
  interface TabState {
    path: string;
    fileName: string;
    fileContent: string;

    isChanged: boolean;
    isSaved: boolean;

    highlightMode: string;
    caret: { line: number; column: number };
  }

  interface FileExplorerItemState {
    path: string;
    isDirectory: boolean;
    isFile: boolean;
    isExpanded: boolean;
    isRoot: boolean;
    children: { [path: string]: FileExplorerItemState };
  }

  interface FileExplorerState {
    tree: FileExplorerItemState;
  }

  interface EditorState {
    element: HTMLElement;
  }

  interface EditorsState {
    activeEditor: string;
    [id: string]: EditorState;
  }

  interface TabManagerState {
    openedTab: string;
    tabs: string[];
  }

  interface TabsState {
    [path: string]: TabState;
  }

  interface WorkspaceState {
    [path: string]: FileExplorerState;
  }

  interface State {
    editors: EditorsState;
    tabManagers: {
      [id: string]: TabManagerState;
    };
    tabs: TabsState;
    workspace: WorkspaceState;
  }

  interface ExplorerItem {
    name: string;
    isDirectory: boolean;
    isFile: boolean;
  }
}

export declare global {
  interface Window {
    ds: {
      /** Get the platform of the current system */
      platform: string;
      /** Write data to the file with the given path and return the path of the file */
      write(path: string, data: string): string;
      /** Read data from the file with the given path and return it */
      read(path: string): string | null;
      /** Delete the file with the given path */
      delete(path: string, isFile: boolean): void;
      /** Create a directory with the given path */
      mkdir(path: string): void;
      /** Rename the file or directory with the given path */
      rename(path: string, newName: string): void;
      /** Show content of the directory with the given path */
      explore(path: string): DustyRose.ExplorerItem[];
      /** Open dialog with the given options and return result of the dialog */
      open(options: Electron.OpenDialogSyncOptions): string[];
      /** Get setting value with the given key */
      getSetting<T>(key: string): T;
      /** Event listener for the given event name from the main process */
      on(channel: string, func: (...args: any[]) => void): void;
    };

    /** State of editor */
    state: Dusty.State;
  }
}
