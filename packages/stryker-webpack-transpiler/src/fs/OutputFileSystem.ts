import { PathLike } from 'fs';
import * as path from 'path';
import { File } from 'stryker-api/core';
import webpack from '../compiler/Webpack';

interface EmptyCallback {
  (err: Error): void;
}

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
    return Object.keys(this._files).map(fileName =>
      new File(fileName, this._files[fileName]));
  }

  public mkdirp(dir: string, opts: any, cb?: (err: Error) => void): void {
    const callback: (err?: Error) => void = cb || opts;
    callback();
  }

  public rmdir(name: PathLike, callback: EmptyCallback): void {
    (callback as any)();
  }

  public mkdir(name: PathLike, callback: EmptyCallback): void {
    (callback as any)();
  }

  public unlink(name: PathLike, callback: EmptyCallback): void {
    const fullName = path.resolve(name.toString());
    delete this._files[fullName];
    (callback as any)();
  }

  public writeFile(name: PathLike | number, data: any, options: any, cb?: EmptyCallback): void {
    const callback: EmptyCallback = cb || options;
    this._files[path.resolve(name.toString())] = data;
    (callback as any)();
  }

  public join(...paths: string[]): string {
    return path.join(...paths);
  }
}

