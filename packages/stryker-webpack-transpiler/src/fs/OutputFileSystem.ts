import { PathLike } from 'fs';
import * as path from 'path';
import { webpack, EmptyCallback, Callback } from '../types';
import { BinaryFile, TextFile, FileKind } from 'stryker-api/core';
import ChunkSorter, { Chunk } from '../compiler/ChunkSorter';

const binaryFileExtensions = Object.freeze(['.ico', '.zip']);

export default class OutputFileSystem implements webpack.OutputFileSystem {

  private _files: {
    [name: string]: string | Buffer;
  };

  constructor() {
    this.purge();
  }

  purge() {
    this._files = Object.create(null);
  }

  isBinary(fileName: string) {
    return binaryFileExtensions.indexOf(path.extname(fileName)) >= 0;
  }

  collectFiles(chunks: Chunk[]): Array<BinaryFile | TextFile> {
    const files: Array<BinaryFile | TextFile> = [];
    Object.keys(this._files).forEach(fileName => {
      const fileContent = this._files[fileName];
      // Best guess the file properties based on the extension
      // Far from ideal, but i don't know any other way.
      if (this.isBinary(fileName) && typeof fileContent !== 'string') {
        files.push({
          name: fileName,
          kind: FileKind.Binary,
          mutated: false,
          included: false,
          transpiled: true,
          content: fileContent
        });
      } else {
        files.push({
          name: fileName,
          kind: FileKind.Text,
          mutated: true,
          included: true,
          transpiled: true,
          content: fileContent.toString()
        });
      }
    });

    const sortedFiles = new ChunkSorter()
      .sortedFileNames(chunks);
    files.sort((a, b) => {
      const aName = path.basename(a.name);
      const bName = path.basename(b.name);
      return sortedFiles.indexOf(aName) - sortedFiles.indexOf(bName);
    });

    return files;
  }

  mkdirp(dir: string, opts: any, cb?: Callback<string>): void {
    const callback: Callback<string> = cb || opts;
    callback(null, '');
  }

  rmdir(name: PathLike, callback: EmptyCallback): void {
    callback();
  }

  mkdir(name: PathLike, callback: EmptyCallback): void {
    callback();
  }

  unlink(name: PathLike, callback: EmptyCallback): void {
    const fullName = path.resolve(name.toString());
    delete this._files[fullName];
    callback();
  }

  writeFile(name: PathLike | number, data: any, options: any, cb?: EmptyCallback): void {
    const callback: EmptyCallback = cb || options;
    this._files[path.resolve(name.toString())] = data;
    callback();
  }

  join(...paths: string[]): string {
    return path.join(...paths);
  }
}

