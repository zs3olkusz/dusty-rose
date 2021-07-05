import { initFileStruct } from './aside';
import { Editor } from './window';

export function renderer(): void {
  initFileStruct();

  const editorEl = document.getElementById('editor');
  editorEl.focus();

  const editor = new Editor(editorEl);
}
