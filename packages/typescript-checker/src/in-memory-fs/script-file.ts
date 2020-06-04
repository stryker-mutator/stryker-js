import ts from 'typescript';
import { Mutant } from '@stryker-mutator/api/mutant';
import { FileWatcherCallback } from 'typescript';

export class ScriptFile {
  private originalContent: string;
  constructor(public content: string, public fileName: string, public modifiedTime = new Date()) {
    this.originalContent = content;
  }

  public write(content: string) {
    this.content = content;
    this.originalContent = content;
  }

  public watcher: FileWatcherCallback | undefined;

  public mutate(mutant: Mutant) {
    this.content = `${this.originalContent.substr(0, mutant.range[0])}${mutant.replacement}${this.originalContent.substr(mutant.range[1])}`;
    this.touch();
  }

  public reset() {
    this.content = this.originalContent;
    this.touch();
  }

  private touch() {
    this.modifiedTime = new Date();
    if (!this.watcher) {
      throw new Error(`No watcher registered for ${this.fileName}. Changes would go unnoticed`);
    }
    this.watcher(this.fileName, ts.FileWatcherEventKind.Changed);
  }
}
