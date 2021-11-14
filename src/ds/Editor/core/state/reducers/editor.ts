import { Dusty } from '../../../../../types';
import { emit } from '../events';

export function addEditor(id: string, editor: Dusty.EditorState): void {
  window.state.editors[id] = editor;

  emit('ds:state-editors-changed');
}

export function setActiveEditor(id: string): void {
  window.state.editors.activeEditor = id;

  emit('ds:state-editors-changed');
}
