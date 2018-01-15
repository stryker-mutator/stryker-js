import MemoryFS from './MemoryFS';
import { webpack, Callback } from '../types';
import * as fs from 'fs';
const errors = require('errno');

export default class InputFileSystem implements webpack.InputFileSystem {

  private memoryFS = new MemoryFS();

  writeFileSync(name: string, content: string | Buffer) {
    return this.memoryFS.writeFileSync(name, content);
  }

  stat(path: string, callback: Callback<fs.Stats>): void {
    this.memoryFS.stat(path, (err: Error, stats: any) => {
      if (err) {
        fs.stat(path, callback);
      }
      else {
        callback(err, stats);
      }
    });
  }

  mkdirpSync(path: string) {
    this.memoryFS.mkdirpSync(path);
  }
  readdir(path: string, callback: Callback<string[]>): void {
    this.memoryFS.readdir(path, (err: Error, file: string[]) => {
      if (err) {
        fs.readdir(path, callback);
      }
      else {
        callback(err, file);
      }
    });
  }

  readFile(path: any, optArg: any, callback?: any) {
    if (!callback) {
      callback = optArg;
      optArg = undefined;
    }

    this.memoryFS.readFile(path, optArg, (err: Error, file: string) => {
      if (err) {
        fs.readFile(path, optArg, callback);
      }
      else {
        callback(err, file);
      }
    });
  }

  readlink(path: any, callback?: any) {
    this.memoryFS.readlink(path, (err: Error, file: string) => {
      if (err) {
        fs.readlink(path, callback);
      }
      else {
        callback(err, file);
      }
    });
  }

  statSync(path: string): webpack.FileStats {
    try {
      return this.memoryFS.statSync(path);
    } catch (err) {
      return fs.statSync(path);
    }
  }
  readdirSync(path: string): string[] {
    try {
      return this.memoryFS.readdirSync(path);
    } catch (err) {
      if (err.code === errors.code.ENOTDIR.code) {
        return fs.readdirSync(path);
      }
      else {
        throw err;
      }
    }
  }
  readFileSync(path: string, encoding: string) {
    try {
      return this.memoryFS.readFileSync(path, encoding);
    } catch (err) {
      if (err.code === errors.code.ENOENT.code) {
        return fs.readFileSync(path, encoding);
      }
      else {
        throw err;
      }
    }
  }

  readlinkSync = this.memoryFS.readlinkSync.bind(this.memoryFS);
}