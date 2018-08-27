import MemoryFS from './MemoryFS';
import * as webpack from 'webpack';
import * as fs from 'fs';
import { dirname } from 'path';
import { CachedInputFileSystem, NodeJsInputFileSystem } from 'enhanced-resolve';

// Cache duration is same as webpack has
// => https://github.com/webpack/webpack/blob/efc576c8b744e7a015ab26f1f46932ba3ca7d4f1/lib/node/NodeEnvironmentPlugin.js#L14
const CACHE_DURATION = 60000;

export default class InputFileSystem extends CachedInputFileSystem implements webpack.InputFileSystem {

  private memoryFS = new MemoryFS();

  constructor(innerFS = new NodeJsInputFileSystem()) {
    super(innerFS, CACHE_DURATION);
  }

  public writeFileSync(name: string, content: string | Buffer) {
    this.memoryFS.mkdirpSync(dirname(name));
    if (content === '') {
      // The in-memory fs doesn't like empty strings.
      content = ' ';
    }
    this.memoryFS.writeFileSync(name, content);
  }

  public stat(path: string, callback: (err: Error, stats: any) => void): void {
    this.memoryFS.stat(path, (err: Error, stats: any) => {
      if (err) {
        (super.stat as any)(path, callback);
      }
      else {
        callback(err, stats);
      }
    });
  }

  public readFile(...args: any[]) {
    const originalCallback = args[args.length - 1];
    const newCallback = (error: NodeJS.ErrnoException, content: any) => {
      if (error) {
        (super.readFile as (path: string, callback: (err: NodeJS.ErrnoException, data: Buffer) => void) => void).apply(this, args);
      } else {
        originalCallback(error, content);
      }
    };
    const memoryFSArgs = args.slice(0, args.length - 1);
    memoryFSArgs.push(newCallback);
    this.memoryFS.readFile.apply(this.memoryFS, memoryFSArgs);
  }

  public readFileSync(path: string, encoding?: any) {
    try {
      return this.memoryFS.readFileSync(path, encoding);
    } catch (err) {
      return (super.readFileSync as (filename: string, options?: { flag?: string; }) => Buffer)(path, encoding);
    }
  }

  public statSync(path: string): fs.Stats {
    try {
      return this.memoryFS.statSync(path) as any;
    } catch (err) {
      return (super.statSync as (path: string | Buffer) => fs.Stats)(path);
    }
  }

  readlink(path: string, callback: (err: Error, linkString: string) => void) {
    return (super.readlink as (path: string, callback: (err: Error, linkString: string) => void) => void)(path, callback);
  }
  readlinkSync(path: string): string {
    return (super.readlinkSync as (path: string) => string)(path);
  }
}