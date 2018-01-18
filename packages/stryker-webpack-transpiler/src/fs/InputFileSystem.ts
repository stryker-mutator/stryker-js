import MemoryFS from './MemoryFS';
import { webpack, Callback } from '../types';
import * as fs from 'fs';
const errors = require('errno');
import { dirname } from 'path';
import { getLogger } from 'log4js';

export default class InputFileSystem implements webpack.InputFileSystem {

  private log = getLogger(InputFileSystem.name);
  private memoryFS = new MemoryFS();

  writeFileSync(name: string, content: string | Buffer) {
    if (content === '') {
      // The in-memory fs doesn't like empty strings.
      content = ' ';
    }
    return this.memoryFS.writeFileSync(name, content);
  }

  stat(path: string, callback: Callback<fs.Stats>): void {
    this.memoryFS.stat(path, (err: Error, stats: any) => {
      if (err) {
        this.pullIntoMemory(path, undefined, (err: Error) => {
          if (err) {
            callback(err);
          } else {
            this.memoryFS.stat(path, callback);
          }
        });
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

  private pullIntoMemory(path: any, optArg: any, callback: any) {
    fs.readFile(path, optArg, (err: Error, content: string) => {
      if (err) {
        callback(err);
      } else {
        this.log.debug('Pulling file into memory: %s', path);
        this.mkdirpSync(dirname(path));
        this.writeFileSync(path, content);
        callback(null, content);
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
        this.pullIntoMemory(path, optArg, callback);
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