import { Dusty } from '../../../../../types';
import { emit } from '../events';

export function openFolder(path: string) {
  window.state.workspace[path] = {
    tree: {
      path,
      isDirectory: true,
      isFile: false,
      isExpanded: false,
      isRoot: true,
      children: {},
    },
  };

  emit('ds:state-workspace-changed');
}

export function openFolders(paths: string[]) {
  paths.forEach((path) => {
    window.state.workspace[path] = {
      tree: {
        path,
        isDirectory: true,
        isFile: false,
        isExpanded: false,
        isRoot: true,
        children: {},
      },
    };
  });

  emit('ds:state-workspace-changed');
}

export function updateFolder(path: string, folder: Dusty.FileExplorerState) {
  window.state.workspace[path] = folder;

  emit('ds:state-workspace-changed');
}

export function closeFolder(path: string) {
  delete window.state.workspace[path];

  emit('ds:state-workspace-changed');
}
