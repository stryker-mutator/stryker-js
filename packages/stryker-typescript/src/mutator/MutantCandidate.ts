import * as ts from 'typescript';
import { Range } from 'stryker-api/core';
import { Mutant } from 'stryker-api/mutant';

export default class MutantCandidate implements Mutant {
  public readonly range: Range;
  public readonly fileName: string;

  constructor(public mutatorName: string,
    public original: ts.Node,
    public sourceFile: ts.SourceFile,
    public replacementSourceCode: string,
    public replacementJavascriptCode: string) {
    this.range = [this.original.getStart(this.sourceFile), this.original.getEnd()];
    this.fileName = sourceFile.fileName;
  }

  get originalText(): string {
    return this.original.getFullText(this.sourceFile);
  }

  // static createLocation(node: ts.Node, sourceFile: ts.SourceFile) {
  //   const lineCharStart: ts.LineAndCharacter = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  //   const lineCharEnd: ts.LineAndCharacter = sourceFile.getLineAndCharacterOfPosition(node.getEnd());
  //   const start: Position = { line: lineCharStart.line, column: lineCharStart.character };
  //   const end: Position = { line: lineCharEnd.line, column: lineCharEnd.character };
  //   return { start, end };
  // }

}