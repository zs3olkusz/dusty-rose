import { initFileStruct } from './aside';
import { Editor } from './window';

import { Editor as Editor2 } from '../Editor/editor';

import javascript from '../Editor/highlight/languages/modes/javascript';
import python from '../Editor/highlight/languages/modes/python';

export function renderer(): void {
  initFileStruct();

  const editorEl = document.getElementById('editor');
  editorEl.focus();

  document
    .getElementsByTagName('main')[0]
    .addEventListener('click', () => editorEl.focus());

  // const editor = new Editor(editorEl);

  const editor2 = new Editor2(editorEl, python);
}
