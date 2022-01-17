import ts from 'typescript';

import { ScriptFile } from './script-file';
import { toPosixFileName } from './tsconfig-helpers';

export class HybridFileSystem {
  private readonly files = new Map<string, ScriptFile | undefined>();

  public getFile(fileName: string): ScriptFile | undefined {
    fileName = toPosixFileName(fileName);
    if (!this.files.has(fileName)) {
      return this.getNewFile(fileName);
    }

    return this.files.get(fileName);
  }

  private getNewFile(fileName: string): ScriptFile | undefined {
    const content = ts.sys.readFile(fileName);

    if (typeof content === 'string') {
      const modifiedTime = ts.sys.getModifiedTime!(fileName)!;
      this.files.set(fileName, new ScriptFile(fileName, content, modifiedTime));
    } else {
      this.files.set(fileName, undefined);
    }

    return this.files.get(fileName);
  }

  public writeFile(fileName: string, content: string): ScriptFile {
    fileName = toPosixFileName(fileName);
    const existingFile = this.files.get(fileName);
    if (existingFile) {
      existingFile.write(content);
      return existingFile;
    } else {
      // this.log.trace('Writing to file "%s"', fileName);
      const newFile = new ScriptFile(fileName, content);
      this.files.set(fileName, newFile);
      return newFile;
    }
  }

  public existsInMemory(fileName: string): boolean {
    return !!this.files.get(toPosixFileName(fileName));
  }
}
