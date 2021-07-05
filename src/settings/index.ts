import electron from 'electron';
import path from 'path';
import { readFileSync, writeFileSync } from 'fs';

interface ISettingsData {
  windowBounds: {
    width: number;
    height: number;
  };
  fullscreen: boolean;
}

interface ISettingsDefaults {
  configName: string;
  defaults: ISettingsData;
}

interface ISettings {
  // Path to settings file.
  readonly path: string;
  // settings
  data: ISettingsData;
  // defaults
  readonly defaults: ISettingsData;

  get: (key: keyof ISettingsData) => any;
  set: (key: keyof ISettingsData, val: any) => void;
}

export class Settings implements ISettings {
  readonly path: string;
  data: ISettingsData;
  readonly defaults: ISettingsData;

  constructor(options: ISettingsDefaults) {
    const userDataPath = (electron.app || electron.remote.app).getPath(
      'userData'
    );

    this.defaults = options.defaults;
    this.path = path.join(userDataPath, options.configName + '.json');
    this.data = parseDataFile(this.path, this.defaults);
  }

  get(key: keyof ISettingsData): any {
    return this.data[key] || this.defaults[key];
  }

  set(key: keyof ISettingsData, val: any): void {
    this.data[key] = val;

    writeFileSync(this.path, JSON.stringify(this.data));
  }
}

function parseDataFile(
  filePath: string,
  defaults: ISettingsData
): ISettingsData {
  try {
    return JSON.parse(readFileSync(filePath) as any);
  } catch (error) {
    return defaults;
  }
}
