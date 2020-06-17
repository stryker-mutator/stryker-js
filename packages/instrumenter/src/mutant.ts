import { types } from '@babel/core';
import generate from '@babel/generator';

import { isLineBreak } from './util/char-helpers';

export interface NodeMutation {
  replacement: types.Node;
  original: types.Node;
}
export interface NamedNodeMutation extends NodeMutation {
  mutatorName: string;
}

export class Mutant {
  constructor(public id: number, public original: types.Node, public replacement: types.Node, public fileName: string, public mutatorName: string) {}

  public originalLines(originalText: string): string {
    const [startIndex, endIndex] = this.getMutationLineIndexes(originalText);
    return originalText.substring(startIndex, endIndex);
  }

  private getMutationLineIndexes(originalText: string): [number, number] {
    let startIndexLines = this.original.start!;
    let endIndexLines = this.original.end!;
    while (startIndexLines > 0 && !isLineBreak(originalText.charCodeAt(startIndexLines - 1))) {
      startIndexLines--;
    }
    while (endIndexLines < originalText.length && !isLineBreak(originalText.charCodeAt(endIndexLines))) {
      endIndexLines++;
    }
    return [startIndexLines, endIndexLines];
  }

  public mutatedLines(originalText: string): string {
    const [startIndex, endIndex] = this.getMutationLineIndexes(originalText);
    return `${originalText.substring(startIndex, this.original.start!)}${generate(this.replacement).code}${originalText.substring(
      this.original.end!,
      endIndex
    )}`;
  }
}
