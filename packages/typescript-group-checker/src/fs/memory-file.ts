import { Mutant, Position } from '@stryker-mutator/api/core';
import ts from 'typescript';

export class File {
  private sourceFile: ts.SourceFile | undefined;
  public mutant: Mutant | undefined;
  private readonly originalContent: string;
  public modifiedTime = new Date();
  public watcher: ts.FileWatcherCallback | undefined;

  constructor(public fileName: string, public content: string) {
    this.originalContent = content;
  }

  public write(data: string): void {
    this.modifiedTime = new Date();
    this.content = data;
    this.watcher?.(this.fileName, ts.FileWatcherEventKind.Changed);
  }

  public mutate(mutant: Mutant): void {
    this.modifiedTime = new Date();
    this.mutant = mutant;
    const start = this.getOffset(mutant.location.start);
    const end = this.getOffset(mutant.location.end);
    const original = this.content;
    this.content = `${original.substr(0, start)}${mutant.replacement}${original.substr(end)}`;
    this.watcher?.(this.fileName, ts.FileWatcherEventKind.Changed);
  }

  public reset(): void {
    this.modifiedTime = new Date();
    this.content = this.originalContent;
    this.watcher?.(this.fileName, ts.FileWatcherEventKind.Changed);
  }

  private getOffset(pos: Position): number {
    if (!this.sourceFile) {
      this.sourceFile = ts.createSourceFile(this.fileName, this.content, ts.ScriptTarget.Latest, false, undefined);
    }
    return this.sourceFile.getPositionOfLineAndCharacter(pos.line, pos.column);
  }
}
