import { ipcRenderer, contextBridge } from 'electron';
import { PathLike } from 'fs';

contextBridge.exposeInMainWorld('ds', {
  platform(): string {
    return ipcRenderer.sendSync('platform');
  },
  write(path: PathLike, data: string): void {
    ipcRenderer.send('write', { path, data });
  },
  read(path: PathLike): string {
    return ipcRenderer.sendSync('read', path);
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
