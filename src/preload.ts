import { ipcRenderer, contextBridge } from 'electron';
import { PathLike } from 'fs';

contextBridge.exposeInMainWorld('ds', {
  platform: process.platform,
  write(path: PathLike, data: string): string {
    return ipcRenderer.sendSync('ds:write', path, data);
  },
  read(path: PathLike): string {
    return ipcRenderer.sendSync('ds:read', path);
  },
  delete(path: PathLike, isFile: boolean): void {
    ipcRenderer.send('ds:delete', path, isFile);
  },
  mkdir(path: PathLike): void {
    ipcRenderer.send('ds:mkdir', path);
  },
  rename(path: PathLike, newName: string): void {
    ipcRenderer.send('ds:rename', path, newName);
  },
  explore(path: PathLike): ExplolerItem[] {
    return ipcRenderer.sendSync('ds:explore', path);
  },
});
