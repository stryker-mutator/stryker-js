import { File, Location, Position, Range } from '@stryker-mutator/api/core';

const enum CharacterCodes {
  MaxAsciiCharacter = 0x7F,
  LineFeed = 0x0A,              // \n
  CarriageReturn = 0x0D,        // \r
  LineSeparator = 0x2028,
  ParagraphSeparator = 0x2029
}

export function isLineBreak(ch: number): boolean {
  // ES5 7.3:
  // The ECMAScript line terminator characters are listed in Table 3.
  //     Table 3: Line Terminator Characters
  //     Code Unit Value     Name                    Formal Name
  //     \u000A              Line Feed               <LF>
  //     \u000D              Carriage Return         <CR>
  //     \u2028              Line separator          <LS>
  //     \u2029              Paragraph separator     <PS>
  // Only the characters in Table 3 are treated as line terminators. Other new line or line
  // breaking characters are treated as white space but not as line terminators.

  return ch === CharacterCodes.LineFeed ||
    ch === CharacterCodes.CarriageReturn ||
    ch === CharacterCodes.LineSeparator ||
    ch === CharacterCodes.ParagraphSeparator;
}

export default class SourceFile {

  private readonly lineStarts: number[];

  constructor(public file: File) {
    this.lineStarts = this.computeLineStarts();
  }

  get name() {
    return this.file.name;
  }

  get content(): string {
    return this.file.textContent;
  }

  public getLocation(range: Range): Location {
    return {
      end: this.getPosition(range[1]),
      start: this.getPosition(range[0])
    };
  }

  public getPosition(pos: number): Position {
    let lineNumber = this.binarySearch(pos);
    if (lineNumber < 0) {
      // If the actual position was not found,
      // the binary search returns the 2's-complement of the next line start
      // e.g. if the line starts at [5, 10, 23, 80] and the position requested was 20
      // then the search will return -2.
      //
      // We want the index of the previous line start, so we subtract 1.
      // Review 2's-complement if this is confusing.
      lineNumber = ~lineNumber - 1;
    }
    return {
      column: pos - this.lineStarts[lineNumber],
      line: lineNumber
    };
  }

  /**
   * Performs a binary search, finding the index at which 'value' occurs in 'array'.
   * If no such index is found, returns the 2's-complement of first index at which
   * number[index] exceeds number.
   * @param array A sorted array whose first element must be no larger than number
   * @param number The value to be searched for in the array.
   */
  private binarySearch(position: number, offset = 0): number {
    let low = offset;
    let high = this.lineStarts.length - 1;

    while (low <= high) {
      const middle = low + ((high - low) >> 1);
      const midValue = this.lineStarts[middle];

      if (midValue === position) {
        return middle;
      }
      else if (midValue > position) {
        high = middle - 1;
      }
      else {
        low = middle + 1;
      }
    }

    return ~low;
  }
  private computeLineStarts(): number[] {
    const result: number[] = [];
    let pos = 0;
    let lineStart = 0;
    const markLineStart = () => {
      result.push(lineStart);
      lineStart = pos;
    };
    while (pos < this.file.textContent.length) {
      const ch = this.file.textContent.charCodeAt(pos);
      pos++;
      switch (ch) {
        case CharacterCodes.CarriageReturn:
          if (this.file.textContent.charCodeAt(pos) === CharacterCodes.LineFeed) {
            pos++;
          }
          markLineStart();
          break;
        case CharacterCodes.LineFeed:
          markLineStart();
          break;
        default:
          if (ch > CharacterCodes.MaxAsciiCharacter && isLineBreak(ch)) {
            markLineStart();
          }
          break;
      }
    }
    result.push(lineStart);
    return result;
  }
}
