import { Mutant, Position } from '@stryker-mutator/api/core';
import ts from 'typescript';

export class ScriptFile {
  private sourceFile: ts.SourceFile | undefined;
  private readonly originalContent: string;
  public watcher: ts.FileWatcherCallback | undefined;

  constructor(public fileName: string, public content: string, public modifiedTime = new Date()) {
    this.originalContent = content;
  }

  public write(data: string): void {
    this.modifiedTime = new Date();
    this.content = data;
    this.watcher?.(this.fileName, ts.FileWatcherEventKind.Changed);
  }

  public mutate(mutant: Pick<Mutant, 'location' | 'replacement'>): void {
    this.guardMutationIsWatched();
    this.modifiedTime = new Date();
    const start = this.getOffset(mutant.location.start);
    const end = this.getOffset(mutant.location.end);
    this.content = `${this.originalContent.substr(0, start)}${mutant.replacement}${this.originalContent.substr(end)}`;
    this.watcher?.(this.fileName, ts.FileWatcherEventKind.Changed);
  }

  public reset(): void {
    this.guardMutationIsWatched();
    this.modifiedTime = new Date();
    this.content = this.originalContent;
    this.watcher?.(this.fileName, ts.FileWatcherEventKind.Changed);
  }

  private guardMutationIsWatched() {
    if (!this.watcher) {
      throw new Error(
        `Tried to check file "${this.fileName}" (which is part of your typescript project), but no watcher is registered for it. Changes would go unnoticed. This probably means that you need to expand the files that are included in your project.`
      );
    }
  }

  private getOffset(pos: Position): number {
    if (!this.sourceFile) {
      this.sourceFile = ts.createSourceFile(this.fileName, this.content, ts.ScriptTarget.Latest, false, undefined);
    }
    return this.sourceFile.getPositionOfLineAndCharacter(pos.line, pos.column);
  }
}
