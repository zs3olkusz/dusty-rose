import { htmlToText, textToHtml } from '../core/text';

class Match {
  index: number;
  classes: string;
  type: string;
  length: number;
  match: string;
  precedence: number;

  constructor(
    index: number,
    classes: string,
    type: string,
    length: number,
    match: string,
    precedence: number
  ) {
    this.index = index;
    this.classes = classes;
    this.type = type;
    this.length = length;
    this.match = match;
    this.precedence = precedence;
  }
}

export class Highlighter {
  returnClassName: string = 'highlight';

  constructor(public readonly el: HTMLElement, public mode: any) {}

  private _sortArrayByObjectsIndex(array: Match[]): void {
    array.sort((a, b) => {
      if (a.index === b.index) {
        return a.precedence - b.precedence;
      }
      return a.index - b.index;
    });
  }

  private _removeDuplicateObjectsFromArray(
    array: Match[],
    shouldRemove: (a: Match, b: Match) => number
  ): void {
    for (let i = 1; i < array.length; i++) {
      const side = shouldRemove(array[i - 1], array[i]);

      if (side < 0) {
        // left
        array.splice(i - 1, 1);
        i--;
      } else if (side > 0) {
        // right
        array.splice(i, 1);
        i--;
      }
    }
  }

  private _wrapTextWithSpan(
    text?: string,
    classes?: string,
    start?: number,
    end?: number
  ): boolean | string {
    if (typeof text === 'undefined') return false;
    if (typeof classes === 'undefined') classes = '';
    if (typeof start === 'undefined') start = 0;
    if (typeof end === 'undefined') end = text.length;

    // Get the text at different points
    const beginning = text.substring(0, start);
    const middle = text
      .substring(start, end)
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
    const ending = text.substring(end);

    // Wrap the match with a span
    return `${beginning}<span class="${classes}">${middle}</span>${ending}`;
  }

  private _getMatchesArrayFromRegex(regexObject: any, str: string): Match[] {
    const matchesArray: Match[] = [];
    let precedenceCounter = 1;

    for (let index = 0; index < regexObject.length; index++) {
      const matchObject = regexObject[index];
      const type = matchObject['type'];
      const regexes = matchObject['regexes'];
      let precedence;

      // Check if the precedence option has been set in the syntax
      if (matchObject.precedence) {
        if (isNaN(matchObject.precedence)) {
          let found = false;

          for (let i = 0; i < matchesArray.length; i++)
            if (matchObject.precedence == matchesArray[i].type) {
              precedence = matchesArray[i].precedence;
              found = true;

              break;
            }

          if (!found) precedence = precedenceCounter;
        } else {
          precedence = parseInt(matchObject.precedence);
        }

        precedenceCounter--;
      } else {
        precedence = precedenceCounter;
      }

      // loop the individual regex
      for (let i = 0; i < regexes.length; i++) {
        let regexString, captureGroup;

        if (typeof regexes[i] === 'string') {
          // Just a single regex
          regexString = regexes[i];
          captureGroup = 0;
        } else {
          // Regex object provided
          regexString = regexes[i]['regexString'];
          captureGroup = regexes[i]['captureGroup'];
        }

        const matches = this._findRegexMatches(
          str,
          regexString,
          captureGroup,
          type,
          precedence
        );

        matchesArray.push.apply(matchesArray, matches);
      }

      precedenceCounter++;
    }

    return matchesArray;
  }

  private _findRegexMatches(
    str: string,
    regexString: string,
    captureGroup: number,
    type: string,
    precedence: number
  ): Match[] {
    const matchesArray = [];
    const reg = new RegExp(regexString, 'gm');
    let match;

    while ((match = reg.exec(str))) {
      const index = match.index;

      if (captureGroup >= match.length) captureGroup = 0;

      // Compensate for captureGroup moving the start of match
      const matchText = match[captureGroup];
      const offset = match[0].indexOf(matchText);

      // Save the results into an object array
      const matchObject = new Match(
        index + offset,
        `${this.returnClassName} ${type}`,
        type,
        matchText.length,
        matchText,
        precedence
      );
      matchesArray.push(matchObject);
    }

    return matchesArray;
  }

  private _defaultDuplicateFunction(a: Match, b: Match): number {
    if (a.index == b.index) {
      if (a.precedence == b.precedence) {
        if (a.length == b.length) return -1;

        return a.length - b.length;
      }

      return a.precedence - b.precedence;
    }

    // If b completely contained within a, remove b
    else if (b.index > a.index && b.index + b.length < a.index + a.length) {
      return 1;
    }
    // If b starts inside a, but continues past the end of a
    else if (
      b.index > a.index &&
      b.index < a.index + a.length &&
      b.index + b.length >= a.index + a.length
    ) {
      if (a.precedence != b.precedence) {
        return a.precedence - b.precedence;
      } else if (a.length != b.length) {
        return a.length - b.length;
      }

      return -1;
    }

    return 0;
  }

  private _insertSyntaxHighlighting(
    regexObject: any,
    str: string,
    duplicateFunction?: (a: Match, b: Match) => number
  ): string {
    if (typeof duplicateFunction === 'undefined') {
      duplicateFunction = this._defaultDuplicateFunction;
    }

    // Convert <br> to \n, &lt; to >, and &gt; to >
    str = str
      .replaceAll('<br>', '\n')
      .replaceAll('&lt;', '<')
      .replaceAll('&gt;', '>');

    // Finds all of the matches and stores them into an array
    const matchesArray = this._getMatchesArrayFromRegex(regexObject, str);

    // Sort and remove latter matches so its top priority
    this._sortArrayByObjectsIndex(matchesArray);

    // Remove objects which are direct matches and if they are inside a wrapping
    // pattern match
    // < is remove left
    // > is remove right
    // 0 is dont remove
    this._removeDuplicateObjectsFromArray(matchesArray, duplicateFunction);

    // Return the new string with its matches wrapped in span tags
    return this._assembleNewStringFromMatchArray(str, matchesArray);
  }

  public highlight(): void {
    const textContent = htmlToText(this.el as HTMLElement);
    const result = this._insertSyntaxHighlighting(
      this.mode,
      textContent.join('\n')
    );

    if (result) {
      this.el.innerHTML = textToHtml(result);
    }
  }

  public changeMode(mode: any): void {
    this.mode = mode;

    this.highlight();
  }

  private _assembleNewStringFromMatchArray(
    str: string,
    array: Match[]
  ): string {
    let offset = 0;

    for (let i = 0; i < array.length; i++) {
      const match = array[i];
      const index = match.index + offset;
      const classes = match.classes;
      const length = match.length;

      str = this._wrapTextWithSpan(
        str,
        classes,
        index,
        index + length
      ) as string;

      // Update the offset
      offset += ("<span class=''></span>" + classes).length;
    }

    return str;
  }
}
