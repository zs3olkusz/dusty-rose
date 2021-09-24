import { Editor } from '../Editor/editor';

export function renderer(): void {
  const editorEl = document.getElementById('editor');

  const editor = new Editor(editorEl);
}
