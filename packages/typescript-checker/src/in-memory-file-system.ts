import ts from 'typescript';
import { Mutant } from '@stryker-mutator/api/mutant';

import { ScriptFile } from './script-file';

function toTSFileName(fileName: string) {
  return fileName.replace(/\\/g, '/');
}

export class InMemoryFileSystem {
  private readonly files = new Map<string, ScriptFile | undefined>();
  private mutatedFile: ScriptFile | undefined;

  public mutate(mutant: Mutant) {
    const fileName = toTSFileName(mutant.fileName);
    const file = this.files.get(fileName);
    if (!file) {
      throw new Error(`File "${mutant.fileName}" cannot be found.`);
    }
    if (this.mutatedFile && this.mutatedFile !== file) {
      this.mutatedFile.reset();
    }
    file.mutate(mutant);
    this.mutatedFile = file;
  }

  public addFileSystemWatcher(fileName: string, watcher: ts.FileWatcherCallback) {
    const file = this.getFile(fileName);
    if (!file) {
      throw new Error(`Cannot find file ${fileName} for watching`);
    }
    file.watcher = watcher;
  }

  public getFile(fileName: string): ScriptFile | undefined {
    if (!this.files.has(fileName)) {
      let content = ts.sys.readFile(fileName);
      if (content) {
        let modifiedTime = ts.sys.getModifiedTime!(fileName)!;
        this.files.set(fileName, new ScriptFile(content, fileName, modifiedTime));
      } else {
        this.files.set(fileName, undefined);
      }
    }
    return this.files.get(fileName);
  }

  public existsInMemory(fileName: string): boolean {
    return this.files.has(toTSFileName(fileName));
  }
}
