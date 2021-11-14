export class DSMenu {
  initMenu(): Array<Electron.MenuItemConstructorOptions | Electron.MenuItem> {
    return [this.fileMenu(), this.editMenu(), this.selectionMenu()];
  }

  fileMenu(): Electron.MenuItemConstructorOptions | Electron.MenuItem {
    return {
      label: 'File',
      submenu: [
        {
          label: 'New File',
          click: (_, browser) => {
            browser.webContents.send('ds:newFile');
          },
          accelerator: 'CommandOrControl+N',
        },
        {
          type: 'separator',
        },
        {
          label: 'Open File...',
          click: (_, browser) => {
            browser.webContents.send('ds:openFile');
          },
          accelerator: 'CommandOrControl+O',
        },
        {
          label: 'Open Folder...',
          click: (_, browser) => {
            browser.webContents.send('ds:openFolder');
          },
          accelerator: 'CommandOrControl+Alt+O',
        },
        {
          label: 'Open Recent',
          role: 'recentDocuments',
          submenu: [
            {
              label: 'Clear Recently Opened',
              role: 'clearRecentDocuments',
            },
          ],
        },
        {
          type: 'separator',
        },
        {
          label: 'Save',
          click: (_, browser) => {
            browser.webContents.send('ds:save');
          },
          accelerator: 'CommandOrControl+S',
        },
        {
          label: 'Save as...',
          click: (_, browser) => {
            browser.webContents.send('ds:saveAs');
          },
          accelerator: 'CommandOrControl+Shift+S',
        },
        {
          label: 'Save all',
          click: (_, browser) => {
            browser.webContents.send('ds:saveAll');
          },
          accelerator: 'CommandOrControl+Alt+S',
        },
        {
          type: 'separator',
        },
        { label: 'Exit', role: 'quit' },
      ],
    };
  }

  editMenu(): Electron.MenuItemConstructorOptions | Electron.MenuItem {
    return {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          role: 'undo',
          accelerator: 'CommandOrControl+Z',
        },
        {
          label: 'Redo',
          role: 'redo',
          accelerator: 'CommandOrControl+Y',
        },
        {
          type: 'separator',
        },
        {
          label: 'Cut',
          role: 'cut',
          accelerator: 'CommandOrControl+X',
        },
        {
          label: 'Copy',
          role: 'copy',
          accelerator: 'CommandOrControl+C',
        },
        {
          label: 'Paste',
          role: 'paste',
          accelerator: 'CommandOrControl+V',
        },
      ],
    };
  }

  selectionMenu(): Electron.MenuItemConstructorOptions | Electron.MenuItem {
    return {
      label: 'Selection',
      submenu: [
        {
          label: 'Select All',
          role: 'selectAll',
          accelerator: 'CommandOrControl+A',
        },
      ],
    };
  }
}
