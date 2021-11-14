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
    childs: [],
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

export function closeFolder(path: string): void {
  delete window.state.workspace[path];

  emit('ds:state-workspace-changed');
}

export function addChild(child: Dusty.FileExplorerItemState): void {
  const { basePath, path, parent } = child;

  window.state.workspace[basePath].tree[path] = child;

  // add child to parent

  // FIXME: this is not working. It's not changing state.
  // in the function scope, everything is fine.
  // in the global scope, it's not.
  window.state.workspace[basePath].tree[parent].childs.push(path);

  // it will show the list of childs
  // but if you check window.state it will show empty array
  // console.log(window.state.workspace[basePath].tree[parent].childs);
  // console.log(window.state);

  emit('ds:state-workspace-changed');
}

export function updateChild(
  child: Dusty.FileExplorerItemState,
  data: Partial<Dusty.FileExplorerItemState>
): void {
  const { path, basePath } = child;

  window.state.workspace[basePath].tree[path] = {
    ...child,
    ...data,
  };

  emit('ds:state-workspace-changed');
}

export function removeChild(child: Dusty.FileExplorerItemState): void {
  delete window.state.workspace[child.basePath].tree[child.path];

  emit('ds:state-workspace-changed');
}
