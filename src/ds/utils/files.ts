export const enum LineEnding {
  CRLF,
  LF,
}

/** Gets the file name from a path */
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

/** Gets the base path from the path */
export function getBasePath(fullPath: string): string {
  const lastSlash = fullPath.lastIndexOf('/');

  if (lastSlash === fullPath.length - 1) {
    return fullPath.slice(0, fullPath.lastIndexOf('/', fullPath.length - 2));
  }
  return fullPath.slice(0, lastSlash);
}

/** Gets the file extension from a path */
export function getFileExtension(fullPath: string): string {
  const baseName = getBaseName(fullPath);
  const idx = baseName.lastIndexOf('.');

  if (idx === -1) return '';

  return baseName.substr(idx + 1);
}

/** Checks file's line endings */
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

/** Gets file's line endings base on the platform */
export function getLineEndings(): LineEnding {
  return window.ds.platform === 'win32' ? LineEnding.CRLF : LineEnding.LF;
}

/** Converts line endings to the windowses line endings */
export function convertWindowsPathToUnixPath(path: string): string {
  if (window.ds.platform === 'win32') {
    path = path.replace(/\\/g, '/');
  }
  return path;
}
