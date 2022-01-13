import ts from 'typescript';

import { File } from './memory-file';
import { toPosixFileName } from './tsconfig-helpers';

export class MemoryFileSystem {
  public files: Record<string, File> = {};

  public getFile(fileName: string): File {
    fileName = toPosixFileName(fileName);
    if (this.files[fileName]) {
      return this.files[fileName];
    }

    return this.getNewFile(fileName);
  }

  private getNewFile(fileName: string): File {
    const content = ts.sys.readFile(fileName);

    if (typeof content === 'string') {
      const modifiedTime = ts.sys.getModifiedTime!(fileName)!;
      this.files[fileName] = new File(fileName, content, modifiedTime);
    } else {
      this.files[fileName] = new File(fileName, '');
    }

    return this.files[fileName];
  }

  public writeFile(fileName: string, content: string): File {
    fileName = toPosixFileName(fileName);
    const existingFile = this.files[fileName];
    if (existingFile) {
      existingFile.write(content);
      return existingFile;
    } else {
      // this.log.trace('Writing to file "%s"', fileName);
      const newFile = new File(fileName, content);
      this.files[fileName] = newFile;
      return newFile;
    }
  }
}
