export const enum LineEnding {
  CRLF,
  LF,
}

export function getBaseName(fullPath: string): string {
  const lastSlash = fullPath.lastIndexOf('/');

  if (lastSlash === fullPath.length - 1) {
    return fullPath.slice(
      fullPath.lastIndexOf('/', fullPath.length - 2) + 1,
      -1
    );
  }
  return fullPath.slice(lastSlash + 1);
}

export function getFileExtension(fullPath: string): string {
  const baseName = getBaseName(fullPath);
  const idx = baseName.lastIndexOf('.');

  if (idx === -1) return '';

  return baseName.substr(idx + 1);
}

export function checkLineEndings(text: string): null | LineEnding {
  if (!text) return null;

  const testText = text.substr(0, 1000);
  const hasCRLF = /\r\n/.test(testText);
  const hasLF = /[^\r]\n/.test(testText);

  if ((hasCRLF && hasLF) || (!hasCRLF && !hasLF)) {
    return null;
  }
  return hasCRLF ? LineEnding.CRLF : LineEnding.LF;
}

export function getLineEndings(): LineEnding {
  return window.ds.platform === 'win32' ? LineEnding.CRLF : LineEnding.LF;
}

export function convertWindowsPathToUnixPath(path: string): string {
  if (window.ds.platform === 'win32') {
    path = path.replace(/\\/g, '/');
  }
  return path;
}
