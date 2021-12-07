import ts from 'typescript';

import { File } from './memory-file';
import { toPosixFileName } from './tsconfig-helpers';

export class MemoryFileSystem {
  public files: Record<string, File> = {};

  public getFile(fileName: string): File | undefined {
    if (this.files[toPosixFileName(fileName)]) {
      return this.files[toPosixFileName(fileName)];
    }

    return this.getNewFile(toPosixFileName(fileName));
  }

  private getNewFile(fileName: string): File | undefined {
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
    const file = new File(fileName, content);
    this.files[fileName] = file;
    return file;
  }
}
