import { PathLike } from 'fs';
import * as path from 'path';

import { File } from '@stryker-mutator/api/core';

import { Callback, EmptyCallback, webpack } from '../types';

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

  public collectFiles(): File[] {
    return Object.keys(this._files).map(fileName => new File(fileName, this._files[fileName]));
  }

  public mkdirp(_dir: string, opts: any, cb?: Callback<string>): void {
    const callback: Callback<string> = cb || opts;
    callback(null);
  }

  public rmdir(_name: PathLike, callback: EmptyCallback): void {
    callback();
  }

  public mkdir(_name: PathLike, callback: EmptyCallback): void {
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
