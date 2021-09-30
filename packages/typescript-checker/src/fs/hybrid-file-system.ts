import ts from 'typescript';
import { Mutant } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';

import { toPosixFileName } from '../tsconfig-helpers';

import { ScriptFile } from './script-file';

/**
 * A very simple hybrid file system.
 * * Readonly from disk
 * * Writes in-memory
 * * Hard caching
 * * Ability to mutate one file
 */
export class HybridFileSystem {
  private readonly files = new Map<string, ScriptFile | undefined>();
  private mutatedFile: ScriptFile | undefined;

  public static inject = tokens(commonTokens.logger);
  constructor(private readonly log: Logger) {}

  public writeFile(fileName: string, data: string): void {
    fileName = toPosixFileName(fileName);
    const existingFile = this.files.get(fileName);
    if (existingFile) {
      existingFile.write(data);
    } else {
      this.log.trace('Writing to file "%s"', fileName);
      this.files.set(fileName, new ScriptFile(data, fileName));
    }
  }

  public mutate(mutant: Pick<Mutant, 'fileName' | 'location' | 'replacement'>): void {
    const fileName = toPosixFileName(mutant.fileName);
    const file = this.files.get(fileName);
    if (!file) {
      throw new Error(`File "${mutant.fileName}" cannot be found.`);
    }
    if (this.mutatedFile && this.mutatedFile !== file) {
      this.mutatedFile.resetMutant();
    }
    file.mutate(mutant);
    this.mutatedFile = file;
  }

  public watchFile(fileName: string, watcher: ts.FileWatcherCallback): void {
    const file = this.getFile(fileName);
    if (file) {
      this.log.trace('Registering watcher for file "%s"', fileName);
      file.watcher = watcher;
    }
  }

  public getFile(fileName: string): ScriptFile | undefined {
    fileName = toPosixFileName(fileName);
    if (!this.files.has(fileName)) {
      const content = ts.sys.readFile(fileName);
      if (typeof content === 'string') {
        const modifiedTime = ts.sys.getModifiedTime!(fileName)!;
        this.files.set(fileName, new ScriptFile(content, fileName, modifiedTime));
      } else {
        this.files.set(fileName, undefined);
      }
    }
    return this.files.get(fileName);
  }

  public existsInMemory(fileName: string): boolean {
    return !!this.files.get(toPosixFileName(fileName));
  }
}
