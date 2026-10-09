import { Position } from '@stryker-mutator/api/core';

/**
 * Calculates the offset (in characters) of a line/column based position in the given content.
 * @param content The content to search in
 * @param position The (zero-based) line/column based position
 */
export function positionToOffset(content: string, position: Position): number {
  let offset = 0;
  for (let line = 0; line < position.line; line++) {
    const indexOfNextNewline = content.indexOf('\n', offset);
    if (indexOfNextNewline === -1) {
      throw new Error(
        `Position ${position.line}:${position.column} is out of bounds (file has ${line + 1} line(s))`,
      );
    }
    offset = indexOfNextNewline + 1;
  }
  return offset + position.column;
}
