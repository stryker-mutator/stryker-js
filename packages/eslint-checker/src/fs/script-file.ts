import ts from 'typescript';
import { Mutant, Position } from '@stryker-mutator/api/core';

export class ScriptFile {
  private readonly originalContent: string;
  private sourceFile: ts.SourceFile | undefined;
  constructor(public content: string, public fileName: string, public modifiedTime = new Date()) {
    this.originalContent = content;
  }

  public write(content: string): void {
    this.content = content;
    this.touch();
  }

  public mutate(mutant: Mutant): void {
    const start = this.getOffset(mutant.location.start);
    const end = this.getOffset(mutant.location.end);
    this.content = `${this.originalContent.substr(0, start)}${mutant.replacement}${this.originalContent.substr(end)}`;
    this.touch();
  }

  private getOffset(pos: Position): number {
    if (!this.sourceFile) {
      this.sourceFile = ts.createSourceFile(this.fileName, this.content, ts.ScriptTarget.Latest);
    }
    return this.sourceFile.getPositionOfLineAndCharacter(pos.line, pos.column);
  }

  public resetMutant(): void {
    this.content = this.originalContent;
    this.touch();
  }

  private touch() {
    this.modifiedTime = new Date();
  }
}
