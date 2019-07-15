import { PathLike } from 'fs';
import * as path from 'path';
import { webpack, EmptyCallback, Callback } from '../types';
import { File } from '@stryker-mutator/api/core';

export default class OutputFileSystem implements webpack.OutputFileSystem {

  private files: {
    [name: string]: string | Buffer;
  };

  constructor() {
    this.purge();
  }

  public purge() {
    this.files = Object.create(null);
  }

  public collectFiles(): File[] {
    return Object.keys(this.files).map(fileName =>
      new File(fileName, this.files[fileName]));
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
    delete this.files[fullName];
    callback();
  }

  public writeFile(name: PathLike | number, data: any, options: any, cb?: EmptyCallback): void {
    const callback: EmptyCallback = cb || options;
    this.files[path.resolve(name.toString())] = data;
    callback();
  }

  public join(...paths: string[]): string {
    return path.join(...paths);
  }
}
