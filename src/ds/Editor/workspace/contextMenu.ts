import { Dusty } from '../../../types';
import { getBaseName } from '../../utils';
import { Dialog } from '../core/dialog';

/** Gets context menu actions for a given element based on its type (file or folder) */
export function getContextMenuOptions({
  isFile,
  isDirectory,
  path,
}: {
  isFile: boolean;
  isDirectory: boolean;
  path: string;
}): Dusty.ContextMenuAction[] {
  if (!isFile && isDirectory) {
    return [
      {
        name: 'Create folder',
        handler: () => {
          new Dialog({
            label: "Folder's name:",
            callback: (folderName: string) => {
              if (folderName) {
                window.ds.mkdir(`${path}/${folderName}`);
              }
            },
            placeholder: 'example',
            inputAttrs: {
              type: 'text',
              required: 'true',
            },
            type: 'input',
          });
        },
      },
      {
        name: 'Create file',
        handler: () => {
          new Dialog({
            label: "File's name:",
            callback: (fileName: string) => {
              if (fileName) {
                // create file via write to file, but we use pass empty string
                window.ds.write(`${path}/${fileName}`, '');
              }
            },
            placeholder: 'example',
            inputAttrs: {
              type: 'text',
              required: 'true',
            },
            type: 'input',
          });
        },
      },
      {
        name: 'Rename',
        handler: (e: MouseEvent) => {
          new Dialog({
            label: "Folder's new name:",
            callback: (newName: string) => {
              if (newName) {
                const basePath = path.split(getBaseName(path))[0];
                const newPath = `${basePath}/${newName}`;

                window.ds.rename(path, newPath);

                (e.target as HTMLElement).dataset.path = newPath;
              }
            },
            placeholder: 'example',
            inputAttrs: {
              type: 'text',
              required: 'true',
            },
            type: 'input',
          });
        },
      },
      {
        name: 'Delete',
        handler: () => {
          window.ds.delete(path, false);
        },
      },
    ];
  }
  return [
    {
      name: 'Rename',
      handler: (e: MouseEvent) => {
        new Dialog({
          label: "File's new name:",
          callback: (newName: string) => {
            if (newName) {
              const basePath = path.split(getBaseName(path))[0];
              const newPath = `${basePath}/${newName}`;

              window.ds.rename(path, newPath);

              (e.target as HTMLElement).dataset.path = newPath;
            }
          },
          placeholder: 'example',
          inputAttrs: {
            type: 'text',
            required: 'true',
          },
          type: 'input',
        });
      },
    },
    {
      name: 'Delete',
      handler: () => {
        window.ds.delete(path, true);
      },
    },
  ];
}
