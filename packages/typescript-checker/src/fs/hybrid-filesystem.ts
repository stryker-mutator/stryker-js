import ts from 'typescript';

import { ScriptFile } from './script-file';
import { toPosixFileName } from './tsconfig-helpers';

export class HybridFileSystem {
  public files: Record<string, ScriptFile> = {};

  public getFile(fileName: string): ScriptFile {
    fileName = toPosixFileName(fileName);
    if (this.files[fileName]) {
      return this.files[fileName];
    }

    return this.getNewFile(fileName);
  }

  private getNewFile(fileName: string): ScriptFile {
    const content = ts.sys.readFile(fileName);

    if (typeof content === 'string') {
      const modifiedTime = ts.sys.getModifiedTime!(fileName)!;
      this.files[fileName] = new ScriptFile(fileName, content, modifiedTime);
    } else {
      this.files[fileName] = new ScriptFile(fileName, '');
    }

    return this.files[fileName];
  }

  public writeFile(fileName: string, content: string): ScriptFile {
    fileName = toPosixFileName(fileName);
    const existingFile = this.files[fileName];
    if (existingFile) {
      existingFile.write(content);
      return existingFile;
    } else {
      // this.log.trace('Writing to file "%s"', fileName);
      const newFile = new ScriptFile(fileName, content);
      this.files[fileName] = newFile;
      return newFile;
    }
  }
}
