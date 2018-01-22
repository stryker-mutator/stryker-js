import { PathLike } from 'fs';
import * as path from 'path';
import { webpack, EmptyCallback, Callback } from '../types';
import { BinaryFile, TextFile, FileKind } from 'stryker-api/core';

const binaryFileExtensions = Object.freeze(['.ico', '.zip']);

export default class OutputFileSystem implements webpack.OutputFileSystem {

  private _files: {
    [name: string]: string | Buffer;
  };

  constructor() {
    this.purge();
  }

  public purge() {
    this._files = Object.create(null);
  }

  private isBinary(fileName: string) {
    return binaryFileExtensions.indexOf(path.extname(fileName)) >= 0;
  }

  public collectFiles(): Array<BinaryFile | TextFile> {
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
    return files;
  }

  public mkdirp(dir: string, opts: any, cb?: Callback<string>): void {
    const callback: Callback<string> = cb || opts;
    callback(null, '');
  }

  public rmdir(name: PathLike, callback: EmptyCallback): void {
    callback();
  }

  public mkdir(name: PathLike, callback: EmptyCallback): void {
    callback();
  }

  public unlink(name: PathLike, callback: EmptyCallback): void {
    const fullName = path.resolve(name.toString());
    delete this._files[fullName];
    callback();
  }

  public writeFile(name: PathLike | number, data: any, options: any, cb?: EmptyCallback): void {
    const callback: EmptyCallback = cb || options;
    this._files[path.resolve(name.toString())] = data;
    callback();
  }

  public join(...paths: string[]): string {
    return path.join(...paths);
  }
}

