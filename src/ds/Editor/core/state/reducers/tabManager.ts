import { Dusty } from '../../../../../types';
import { emit } from '../events';
import { removeTab } from './tabs';

export function addTabManager(
  editor: string,
  manager: Dusty.TabManagerState
): void {
  window.state.tabManagers[editor] = manager;

  emit('ds:tabManager-add', editor);
  emit('ds:state-tabManager-changed', editor);
}

export function setActiveTab(editor: string, path: string): void {
  window.state.tabManagers[editor].openedTab = path;

  emit('ds:tabManager-tab-active', editor, path);
  emit('ds:state-tabManager-changed', editor, path, 'SET_ACTIVE');
}

export function removeTabFromEditor(editor: string, path: string): void {
  window.state.tabManagers[editor].tabs = window.state.tabManagers[
    editor
  ].tabs.filter((tab) => tab !== path);

  for (const manager of Object.values(window.state.tabManagers)) {
    const tabs = manager.tabs;

    if (!tabs.includes(path)) {
      removeTab(path);
    }
  }

  emit('ds:tabManager-tab-close', editor, path);
  emit('ds:state-tabManager-changed', editor, [path], 'REMOVE');
}

export function setOpenedTab(editor: string, path: string): void {
  if (!window.state.tabManagers[editor].tabs.includes(path)) {
    window.state.tabManagers[editor].tabs.push(path);
  }

  window.state.tabManagers[editor].openedTab = path;

  emit('ds:tabManager-tab-open');
  emit('ds:state-tabManager-changed', editor, [path], 'OPEN');
}
