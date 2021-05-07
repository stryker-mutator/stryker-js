import ts from 'typescript';
import { Mutant } from '@stryker-mutator/api/core';
import * as os from 'os';

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

  public mutate(mutant: Pick<Mutant, 'location' | 'replacement'>): void {
    this.guardMutationIsWatched();
    const lines = this.originalContent.split(os.EOL);

    const endLines = lines.slice(0, mutant.location.end.line);
    endLines[endLines.length - 1] = endLines[endLines.length -1].substring(0, mutant.location.end.column);
    const endIndex = endLines.join(os.EOL).length;

    const startLines = lines.slice(0, mutant.location.start.line);
    startLines[startLines.length - 1] = startLines[startLines.length -1].substring(0, mutant.location.start.column);
    const startIndex = startLines.join(os.EOL).length;

    this.content = `${this.originalContent.substr(0, startIndex)}${mutant.replacement}${this.originalContent.substr(endIndex)}`;
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
