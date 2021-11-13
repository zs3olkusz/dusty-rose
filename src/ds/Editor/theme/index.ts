import { Dusty } from '../../../types';

/** Loads theme from the settings */
export function loadTheme(): void {
  const root = document.querySelector(':root') as HTMLElement;
  const settings = window.ds.getSetting<Dusty.Theme>('theme');

  Object.keys(settings).map((setting) => {
    root.style.setProperty(`--${setting}`, settings[setting]);
  });
}
