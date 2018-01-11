import { PathLike } from 'fs';
import * as path from 'path';
import { webpack, EmptyCallback, Callback } from '../types';
import { File, TextFile, FileKind } from 'stryker-api/core';
import { BinaryFile } from 'stryker-api/src/core/File';

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

  collectFiles(): File[] {
    const files: File[] = [];
    Object.keys(this._files).forEach(fileName => {
      const fileContent = this._files[fileName];
      if (typeof fileContent === 'string') {
        const file: TextFile = {
          name: fileName,
          content: fileContent,
          transpiled: true,
          included: true,
          kind: FileKind.Text,
          mutated: true
        };
        files.push(file);
      } else {
        const file: BinaryFile = {
          name: fileName,
          content: fileContent,
          transpiled: true,
          included: true,
          kind: FileKind.Binary,
          mutated: true
        };
        files.push(file);
      }
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
    this._files[path.resolve(name.toString())] = data.toString();
    callback();
  }

  join(...paths: string[]): string {
    return path.join(...paths);
  }
}

