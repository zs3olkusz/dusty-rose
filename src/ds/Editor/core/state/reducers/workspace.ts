import { Dusty } from '../../../../../types';
import { emit } from '../events';

export function openFolder(path: string, basePath?: string): void {
  window.state.workspace[basePath || path] = {
    tree: { ...window.state.workspace[basePath || path]?.tree },
  };

  window.state.workspace[path].tree[path] = {
    path,
    isDirectory: true,
    isFile: false,
    basePath,
    isExpanded: false,
    isRoot: true,
    parent: basePath,
    children: [],
  };

  emit('ds:state-workspace-changed');
}

export function updateFolder(
  path: string,
  folder: Dusty.FileExplorerState
): void {
  window.state.workspace[path] = folder;

  emit('ds:state-workspace-changed');
}

export function closeFolder(path: string) {
  delete window.state.workspace[path];

  emit('ds:state-workspace-changed');
}

export function addFile(path: string, file: Dusty.FileExplorerItemState): void {
  window.state.workspace[file.basePath].tree[path] = file;

  emit('ds:state-workspace-changed');
}

export function updateFile(
  file: Dusty.FileExplorerItemState,
  data: Partial<Dusty.FileExplorerItemState>
) {
  const { path, basePath } = file;

  window.state.workspace[basePath].tree[path] = {
    ...file,
    ...data,
  };

  emit('ds:state-workspace-changed');
}

export function removeFile(file: Dusty.FileExplorerItemState): void {
  delete window.state.workspace[file.basePath].tree[file.path];

  emit('ds:state-workspace-changed');
}
