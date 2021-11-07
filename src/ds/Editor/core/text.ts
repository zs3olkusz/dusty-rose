import { LineEnding, checkLineEndings } from '../../utils/files';

/** Convert text to html */
export function textToHtml(text: string): string {
  let html = '';

  const codeLines = text
    ? checkLineEndings(text) === LineEnding.CRLF
      ? text.split('\r\n')
      : text.split('\n')
    : [];

  codeLines.forEach((line: string) => {
    html += `<div>${line}<br></div>`;
  });

  if (!html) html = '<div><br></div>';

  return html;
}

/** Convert html to text */
export function htmlToText(element: HTMLElement): string[] {
  const content: string[] = [];

  const childrens = element.children;

  for (let index = 0; index < childrens.length; index++) {
    content.push(childrens[index].textContent);
  }

  return content;
}

/** Escape `<` and `>` from the text */
export function escapeCharacters(text: string): string {
  return text.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}
