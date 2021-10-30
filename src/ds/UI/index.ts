import { Editor } from '../Editor/editor';
import { loadTheme } from '../Editor/theme';
import { resizable } from './resizable';
import { showSnackbar } from './snackbar';

export function renderer(): void {
  loadTheme();

  const editorEl = document.getElementById('editor');

  const editor = new Editor(editorEl);

  resizable();

  window.ds.on('ds:error', (title: string, description: string) =>
    showSnackbar(title, description)
  );
}
