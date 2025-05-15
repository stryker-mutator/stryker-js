import ts from 'typescript';
import { Logger } from '@stryker-mutator/api/logging';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';

import { toPosixFileName } from '../tsconfig-helpers.js';

import { ScriptFile } from './script-file.js';

/**
 * A very simple hybrid file system.
 * * Readonly from disk
 * * Writes in-memory
 * * Hard caching
 * * Ability to mutate one file
 */
export class HybridFileSystem {
  private readonly files = new Map<string, ScriptFile | undefined>();

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
        this.files.set(
          fileName,
          new ScriptFile(content, fileName, modifiedTime),
        );
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
