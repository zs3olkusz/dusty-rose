import { Editor } from '../Editor/editor';
import { loadTheme } from '../Editor/theme';
import { resizable } from './resizable';
import { showSnackbar } from './snackbar';

// render the aplication
export function renderer(): void {
  // load the theme
  loadTheme();

  // create the editor
  const editorEl = document.getElementById('editor');

  const editor = new Editor(editorEl);

  // add the resizable option for the aside
  resizable();

  // handle event and show the snackbar
  window.ds.on('ds:error', (title: string, description: string) =>
    showSnackbar(title, description)
  );
}
