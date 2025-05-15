import ts from 'typescript';
import { Mutant, Position } from '@stryker-mutator/api/core';

export class ScriptFile {
  private readonly originalContent: string;
  private sourceFile: ts.SourceFile | undefined;
  constructor(
    public content: string,
    public fileName: string,
    public modifiedTime = new Date(),
  ) {
    this.originalContent = content;
  }

  public write(content: string): void {
    this.content = content;
    this.touch();
  }

  public watcher: ts.FileWatcherCallback | undefined;

  public mutate(mutant: Pick<Mutant, 'location' | 'replacement'>): void {
    this.guardMutationIsWatched();

    const start = this.getOffset(mutant.location.start);
    const end = this.getOffset(mutant.location.end);
    this.content = `${this.originalContent.substr(0, start)}${mutant.replacement}${this.originalContent.substr(end)}`;
    this.touch();
  }

  private getOffset(pos: Position): number {
    if (!this.sourceFile) {
      this.sourceFile = ts.createSourceFile(
        this.fileName,
        this.content,
        ts.ScriptTarget.Latest,
        false,
        undefined,
      );
    }
    return this.sourceFile.getPositionOfLineAndCharacter(pos.line, pos.column);
  }

  public resetMutant(): void {
    this.guardMutationIsWatched();
    this.content = this.originalContent;
    this.touch();
  }

  private guardMutationIsWatched() {
    if (!this.watcher) {
      throw new Error(
        `Tried to check file "${this.fileName}" (which is part of your typescript project), but no watcher is registered for it. Changes would go unnoticed. This probably means that you need to expand the files that are included in your project.`,
      );
    }
  }

  private touch(): void {
    this.modifiedTime = new Date();
    this.watcher?.(this.fileName, ts.FileWatcherEventKind.Changed);
  }
}
