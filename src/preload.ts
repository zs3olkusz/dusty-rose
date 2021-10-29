import { ipcRenderer, contextBridge } from 'electron';
import { PathLike } from 'fs';

contextBridge.exposeInMainWorld('ds', {
  platform: process.platform,
  write(path: PathLike, data: string): string {
    return ipcRenderer.sendSync('ds:write', path, data);
  },
  read(path: PathLike): string | null {
    return ipcRenderer.sendSync('ds:read', path);
  },
  delete(path: PathLike, isFile: boolean): void {
    ipcRenderer.sendSync('ds:delete', path, isFile);
  },
  mkdir(path: PathLike): void {
    ipcRenderer.sendSync('ds:mkdir', path);
  },
  rename(path: PathLike, newName: string): void {
    ipcRenderer.sendSync('ds:rename', path, newName);
  },
  explore(path: PathLike): ExplolerItem[] {
    return ipcRenderer.sendSync('ds:explore', path);
  },
  getSetting<T>(key: string): T {
    return ipcRenderer.sendSync('ds:getSetting', key);
  },
  on(channel: string, func: (...args: any[]) => void): void {
    const validChannels = [
      'ds:newFile',
      'ds:openFile',
      'ds:openFolder',
      'ds:save',
      'ds:saveAs',
      'ds:saveAll',
    ];

    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
});
