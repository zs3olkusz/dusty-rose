import { Dusty } from '../../../../../types';
import { emit } from '../events';

export function addTab(tab: Dusty.TabState): void {
  window.state.tabs[tab.path] = tab;

  emit('ds:tab-add', tab.path);
  emit('ds:state-tabs-changed', [tab.path]);
}

export function updateTab(path: string, data: Partial<Dusty.TabState>): void {
  const tab = window.state.tabs[path];

  if (!tab) {
    return;
  }

  Object.assign(tab, data);

  emit('ds:tab-changed', path);
  emit('ds:state-tabs-changed', [tab.path]);
}

export function removeTab(path: string): void {
  delete window.state.tabs[path];

  emit('ds:tab-remove', path);
  emit('ds:state-tabs-changed', [path]);
}
