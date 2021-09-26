import { Editor } from '../Editor/editor';
import { resizable } from './resizable';

export function renderer(): void {
  const editorEl = document.getElementById('editor');

  const editor = new Editor(editorEl);

  resizable();
}
