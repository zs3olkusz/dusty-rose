import { Editor } from '../Editor/editor';
import { loadTheme } from '../Editor/theme';
import { resizable } from './resizable';

export function renderer(): void {
  loadTheme();

  const editorEl = document.getElementById('editor');

  const editor = new Editor(editorEl);

  resizable();
}
