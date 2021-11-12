import { Dusty } from '../../../../../types';
import { emit } from '../events';

export function addTab(tab: Dusty.TabState) {
  window.state.tabs[tab.path] = tab;

  emit('ds:state-tabs-changed', [tab.path]);
}

export function addTabs(tabs: Dusty.TabState[]) {
  tabs.forEach((tab) => {
    window.state.tabs[tab.path] = tab;
  });

  emit('ds:state-tabs-changed', [tabs.map((tab) => tab.path)]);
}

export function updateTab(tab: Dusty.TabState) {
  window.state.tabs[tab.path] = tab;

  emit('ds:state-tabs-changed', [tab.path]);
}

export function removeTab(path: string) {
  delete window.state.tabs[path];

  emit('ds:state-tabs-changed', [path]);
}

export function removeTabs(paths: string[]) {
  paths.forEach((path) => delete window.state.tabs[path]);

  emit('ds:state-tabs-changed', [paths]);
}
