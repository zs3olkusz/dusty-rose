import { initFileStruct } from './aside';

import { Editor } from '../Editor/editor';

import javascript from '../Editor/highlight/languages/modes/javascript';
import python from '../Editor/highlight/languages/modes/python';

export function renderer(): void {
  initFileStruct();

  const editorEl = document.getElementById('editor');

  const editor = new Editor(editorEl, python);
}
