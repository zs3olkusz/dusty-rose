import { Dusty } from '../../../../../types';
import { emit } from '../events';
import { removeTab } from './tabs';

export function addTabManager(editor: string, manager: Dusty.TabManagerState) {
  window.state.tabManagers[editor] = manager;

  emit('ds:state-tabManager-changed', editor);
}

export function setActiveTab(editor: string, path: string) {
  window.state.tabManagers[editor].openedTab = path;

  emit('ds:state-tabManager-changed', editor, path, 'SET_ACTIVE');
}

export function addTabsToEditor(editor: string, tabs: Dusty.TabState[]) {
  tabs.forEach((tab) => {
    window.state.tabManagers[editor].tabs.push(tab.path);
  });

  emit('ds:state-tabManager-changed', editor, tabs, 'ADD', true);
}

export function removeTabFromEditor(editor: string, path: string) {
  window.state.tabManagers[editor].tabs = window.state.tabManagers[
    editor
  ].tabs.filter((tab) => tab !== path);

  for (const manager of Object.values(window.state.tabManagers)) {
    const tabs = manager.tabs;

    if (!tabs.includes(path)) {
      removeTab(path);
    }
  }

  emit('ds:state-tabManager-changed', editor, [path], 'REMOVE');
}

export function removeTabsFromEditor(editor: string, paths: string[]) {
  window.state.tabManagers[editor].tabs.filter((tab) => !paths.includes(tab));

  emit('ds:state-tabManager-changed', editor, paths, 'REMOVE', true);
}

export function setOpenedTab(editor: string, path: string) {
  if (!window.state.tabManagers[editor].tabs.includes(path)) {
    window.state.tabManagers[editor].tabs.push(path);
  }

  window.state.tabManagers[editor].openedTab = path;

  emit('ds:state-tabManager-changed', editor, [path], 'OPEN');
}
