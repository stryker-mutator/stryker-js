import ts from 'typescript';
import { Mutant } from '@stryker-mutator/api/core';

export class ScriptFile {
  private readonly originalContent: string;
  constructor(public content: string, public fileName: string, public modifiedTime = new Date()) {
    this.originalContent = content;
  }

  public write(content: string): void {
    this.content = content;
    this.touch();
  }

  public watcher: ts.FileWatcherCallback | undefined;

  public mutate(mutant: Pick<Mutant, 'range' | 'replacement'>): void {
    this.guardMutationIsWatched();
    this.content = `${this.originalContent.substr(0, mutant.range[0])}${mutant.replacement}${this.originalContent.substr(mutant.range[1])}`;
    this.touch();
  }

  public resetMutant(): void {
    this.guardMutationIsWatched();
    this.content = this.originalContent;
    this.touch();
  }

  private guardMutationIsWatched() {
    if (!this.watcher) {
      throw new Error(
        `Tried to check file "${this.fileName}" (which is part of your typescript project), but no watcher is registered for it. Changes would go unnoticed. This probably means that you need to expand the files that are included in your project.`
      );
    }
  }

  private touch() {
    this.modifiedTime = new Date();
    this.watcher?.(this.fileName, ts.FileWatcherEventKind.Changed);
  }
}
