import { Tab } from './tab';
import { Editor } from '../editor';

export class TabsManager {
  openedTab: Tab;
  tabs: {
    [path: string]: Tab;
  };

  constructor(public readonly editor: Editor) {
    this.openedTab = null;
    this.tabs = {};
  }

  /** Create new tab and set it as opened */
  public newTab(path: string = ''): void {
    this.openedTab = new Tab(this.editor, path);
    this.tabs[this.openedTab.path] = this.openedTab;
  }
}
