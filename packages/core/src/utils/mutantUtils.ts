import { Mutant } from '@stryker-mutator/api/core';

const enum CharacterCodes {
  MaxAsciiCharacter = 0x7f,
  LineFeed = 0x0a, // \n
  CarriageReturn = 0x0d, // \r
  LineSeparator = 0x2028,
  ParagraphSeparator = 0x2029,
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

  return (
    ch === CharacterCodes.LineFeed ||
    ch === CharacterCodes.CarriageReturn ||
    ch === CharacterCodes.LineSeparator ||
    ch === CharacterCodes.ParagraphSeparator
  );
}

export function originalLines(originalText: string, mutant: Mutant): string {
  const [startIndex, endIndex] = getMutationLineIndexes(originalText, mutant);
  return originalText.substring(startIndex, endIndex);
}

function getMutationLineIndexes(originalText: string, mutant: Mutant): [number, number] {
  let startIndexLines = mutant.range[0];
  let endIndexLines = mutant.range[1];
  while (startIndexLines > 0 && !isLineBreak(originalText.charCodeAt(startIndexLines - 1))) {
    startIndexLines--;
  }
  while (endIndexLines < originalText.length && !isLineBreak(originalText.charCodeAt(endIndexLines))) {
    endIndexLines++;
  }
  return [startIndexLines, endIndexLines];
}

export function mutatedLines(originalText: string, mutant: Mutant): string {
  const [startIndex, endIndex] = getMutationLineIndexes(originalText, mutant);
  return `${originalText.substring(startIndex, mutant.range[0])}${mutant.replacement}${originalText.substring(mutant.range[1], endIndex)}`;
}
