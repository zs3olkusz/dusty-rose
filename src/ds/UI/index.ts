import { initFileStruct } from './aside';

import { Editor } from '../Editor/editor';


export function renderer(): void {
  initFileStruct();

  const editorEl = document.getElementById('editor');

  const editor = new Editor(editorEl);
}
