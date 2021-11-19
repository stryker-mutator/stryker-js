import ts from 'typescript';

import { File } from './memory-file';
import { toPosixFileName } from './tsconfig-helpers';

export class MemoryFileSystem {
  public files: Record<string, File> = {};

  public getFile(fileName: string): File | null {
    if (this.files[toPosixFileName(fileName)]) {
      return this.files[toPosixFileName(fileName)];
    }

    return this.getNewFile(toPosixFileName(fileName));
  }

  private getNewFile(fileName: string): File | null {
    const content = ts.sys.readFile(fileName);
    if (!content) return null;

    const file = new File(fileName, content ?? '');
    this.files[fileName] = file;
    return file;
  }

  public writeFile(fileName: string, content: string): File {
    fileName = toPosixFileName(fileName);
    const file = new File(fileName, content);
    this.files[fileName] = file;
    return file;
  }

  public deleteFile(filename: string): void {
    filename = toPosixFileName(filename);
    delete this.files[filename];
  }

  public readDirectory(
    pathName: string,
    extensions?: readonly string[],
    exclude?: readonly string[],
    include?: readonly string[],
    depth?: number
  ): string[] {
    const content = ts.sys.readDirectory(pathName, extensions, exclude, include, depth);
    pathName = toPosixFileName(pathName);

    Object.keys(this.files).forEach((fileName) => {
      const posFileName = toPosixFileName(fileName);
      // misschien een apart object bijhouden voor mutated files voor performance
      if (this.files[fileName].mutant && RegExp(pathName).exec(posFileName)) {
        content.push(fileName);
      }
    });

    return content;
  }
}
