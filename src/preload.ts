import { ipcRenderer, contextBridge } from 'electron';
import type { Dusty } from './types';

// context bridge is used to communicate between the renderer and main process
contextBridge.exposeInMainWorld('ds', {
  // get the platform of the current system
  platform: process.platform,
  // write data to the file with the given path and return the path of the file
  write(path: string, data: string): string {
    return ipcRenderer.sendSync('ds:write', path, data);
  },
  // read data from the file with the given path and return it
  read(path: string): string | null {
    return ipcRenderer.sendSync('ds:read', path);
  },
  // delete the file with the given path
  delete(path: string, isFile: boolean): void {
    ipcRenderer.sendSync('ds:delete', path, isFile);
  },
  // create a directory with the given path
  mkdir(path: string): void {
    ipcRenderer.sendSync('ds:mkdir', path);
  },
  // rename the file or directory with the given path
  rename(path: string, newName: string): void {
    ipcRenderer.sendSync('ds:rename', path, newName);
  },
  // show content of the directory with the given path
  explore(path: string): Dusty.ExplorerItem[] {
    return ipcRenderer.sendSync('ds:explore', path);
  },
  // open dialog with the given options and return result of the dialog
  open(options: Electron.OpenDialogSyncOptions): string[] {
    return ipcRenderer.sendSync('ds:open', options);
  },
  // get setting value with the given key
  getSetting<T>(key: string): T {
    return ipcRenderer.sendSync('ds:getSetting', key);
  },
  // event listener for the given event name from the main process
  on(channel: string, func: (...args: any[]) => void): void {
    const validChannels = [
      'ds:newFile',
      'ds:openFile',
      'ds:openFolder',
      'ds:save',
      'ds:saveAs',
      'ds:saveAll',
      'ds:error',
    ];

    // check if the channel is valid
    if (!validChannels.includes(channel)) {
      throw new Error(`\`${channel}\` is not valid channel.`);
    }

    // add event listener
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
});
