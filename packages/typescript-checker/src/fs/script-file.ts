import ts from 'typescript';
import { Mutant } from '@stryker-mutator/api/core';
import { FileWatcherCallback } from 'typescript';

export class ScriptFile {
  private readonly originalContent: string;
  constructor(public content: string, public fileName: string, public modifiedTime = new Date()) {
    this.originalContent = content;
  }

  public write(content: string) {
    this.content = content;
    this.touch();
  }

  public watcher: FileWatcherCallback | undefined;

  public mutate(mutant: Pick<Mutant, 'replacement' | 'range'>) {
    this.guardMutationIsWatched();
    this.content = `${this.originalContent.substr(0, mutant.range[0])}${mutant.replacement}${this.originalContent.substr(mutant.range[1])}`;
    this.touch();
  }

  public resetMutant() {
    this.guardMutationIsWatched();
    this.content = this.originalContent;
    this.touch();
  }

  private guardMutationIsWatched() {
    if (!this.watcher) {
      throw new Error(`No watcher registered for ${this.fileName}. Changes would go unnoticed`);
    }
  }

  private touch() {
    this.modifiedTime = new Date();
    this.watcher?.(this.fileName, ts.FileWatcherEventKind.Changed);
  }
}
