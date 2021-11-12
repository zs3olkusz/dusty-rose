import { Dusty } from '../../../../../types';
import { emit } from '../events';

export function addEditor(id: string, editor: Dusty.EditorState) {
  window.state.editors[id] = editor;

  emit('ds:state-editors-changed');
}

export function setActiveEditor(id: string) {
  window.state.editors.activeEditor = id;

  emit('ds:state-editors-changed');
}

export function removeEditor(id: string) {
  delete window.state.editors[id];
  delete window.state.tabManagers[id];

  emit('ds:state-editors-changed');
}
