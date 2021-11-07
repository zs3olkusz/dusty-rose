interface ITheme {
  background1: string;
  background1HEX: string;
  background2: string;
  background3: string;
  foreground1: string;
  foreground2: string;
  fontFamily: string;
  transitionTime1: string;
  transitionTime2: string;
  scrollBarSize: string;
  asideWidth: string;
  asideMinWidth: string;
  fileExplorerItemDepthSize: string;
  fileExplorerItemIconSize: string;
  fileExplorerItemFolderIcon: string;
  fileExplorerItemFolderOpenIcon: string;
  fileExplorerItemFileIcon: string;
  footerHeight: string;
  footerFontSize: string;
  footerItemPaddingHor: string;
  mainFontSize: string;
  navHeight: string;
  navFontSize: string;
  editorFontSize: string;
  editorLineCounterWidth: string;
  syntaxColor1: string;
  syntaxColor2: string;
  syntaxColor3: string;
  syntaxColor4: string;
  syntaxColor5: string;
  syntaxColor6: string;
  [name: string]: string;
}

/** Loads theme from the settings */
export function loadTheme(): void {
  const root = document.querySelector(':root') as HTMLElement;
  const settings = window.ds.getSetting<ITheme>('theme');

  Object.keys(settings).map((setting) => {
    root.style.setProperty(`--${setting}`, settings[setting]);
  });
}
