import { Tab } from './tab';
import {
  addTab,
  addTabManager,
  listen,
  removeTabFromEditor,
  setActiveTab,
  setOpenedTab,
} from '../core/state';

export class TabsManager {
  openedTab: Tab;
  tabs: {
    [path: string]: Tab;
  };

  constructor(readonly editorId: string) {
    this.openedTab = null;
    this.tabs = {};

    addTabManager(this.editorId, {
      openedTab: '',
      tabs: [],
    });

    listen('ds:tabManager-tab-active', (editor: string, path: string) => {
      if (editor !== this.editorId) {
        return;
      }

      this.openedTab = this.tabs[path];
    });

    listen('ds:tab-add', (editorId: string, path: string) => {
      if (editorId === this.editorId) {
        this.newTab(path);
      }
    });

    listen('ds:tabManager-tab-close', (editorId: string, path: string) => {
      if (editorId === this.editorId) {
        this.closeTab(editorId, path);
      }
    });
  }

  /** Create new tab and set it as opened */
  public newTab(path: string = ''): void {
    this.openedTab = new Tab(this.editorId, path);
    this.tabs[this.openedTab.path] = this.openedTab;

    // update state with new tab
    addTab({
      path: this.openedTab.path,
      fileName: this.openedTab.fileName,
      fileContent: this.openedTab.fileContent,
      isChanged: !!this.openedTab.fileContent,
      isSaved: !!this.openedTab.fileContent,
      highlightMode: null,
      caret: { line: 1, column: 1 },
    });
    setOpenedTab(this.editorId, this.openedTab.path);
  }

  /** Close tab */
  public closeTab(editorId: string, path: string): void {
    const tab = this.tabs[path];
    if (tab) {
      delete this.tabs[path];

      removeTabFromEditor(editorId, path);

      if (this.openedTab.path === path) {
        this.openedTab = null;

        // set first tab as opened
        const firstTab = Object.keys(this.tabs)[0];

        if (firstTab) {
          this.openedTab = this.tabs[firstTab];

          setActiveTab(this.editorId, this.openedTab.path);
        } else {
          this.newTab();
        }
      }
    }
  }
}
