import { ipcRenderer, contextBridge } from 'electron';
import { PathLike } from 'fs';

contextBridge.exposeInMainWorld('ds', {
  platform(): string {
    return ipcRenderer.sendSync('ds:platform');
  },
  write(path: PathLike, data: string): string {
    return ipcRenderer.sendSync('ds:write', path, data);
  },
  read(path: PathLike): string {
    return ipcRenderer.sendSync('ds:read', path);
  },
  delete(path: PathLike): void {
    ipcRenderer.send('delete', path);
  },
  mkdir(path: PathLike): void {
    ipcRenderer.send('mkdir', path);
  },
  rename(path: PathLike, newName: string): void {
    ipcRenderer.send('rename', { path, newName });
  },
});
