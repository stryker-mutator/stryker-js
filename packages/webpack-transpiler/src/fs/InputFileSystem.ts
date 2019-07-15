import MemoryFS from './MemoryFS';
import { webpack, Callback } from '../types';
import * as fs from 'fs';
import { dirname } from 'path';
import {
  CachedInputFileSystem,
  NodeJsInputFileSystem,
  Stats
} from 'enhanced-resolve';

// Cache duration is same as webpack has
// => https://github.com/webpack/webpack/blob/efc576c8b744e7a015ab26f1f46932ba3ca7d4f1/lib/node/NodeEnvironmentPlugin.js#L14
const cacheDuration = 60000;

export default class InputFileSystem extends CachedInputFileSystem
  implements webpack.InputFileSystem {
  private readonly memoryFS = new MemoryFS();

  constructor(innerFS = new NodeJsInputFileSystem()) {
    super(innerFS, cacheDuration);
  }

  public writeFileSync(name: string, content: string | Buffer) {
    this.memoryFS.mkdirpSync(dirname(name));
    if (content === '') {
      // The in-memory fs doesn't like empty strings.
      content = ' ';
    }
    this.memoryFS.writeFileSync(name, content);
  }

  public stat(path: string, callback: Callback<fs.Stats>): void {
    this.memoryFS.stat(path, (err?: Error | null, stats?: any) => {
      if (err) {
        super.stat(path, callback as Callback<Stats>);
      } else {
        callback(err, stats);
      }
    });
  }

  public readFile(...args: any[]) {
    const originalCallback = args[args.length - 1];
    const newCallback = (error: NodeJS.ErrnoException, content: any) => {
      if (error) {
        super.readFile.apply(this, args);
      } else {
        originalCallback(error, content);
      }
    };
    const memoryFSArgs = args.slice(0, args.length - 1);
    memoryFSArgs.push(newCallback);
    this.memoryFS.readFile.apply(this.memoryFS, memoryFSArgs);
  }

  public readFileSync(path: string, encoding?: string) {
    try {
      return this.memoryFS.readFileSync(path, encoding);
    } catch (err) {
      return super.readFileSync(path, encoding);
    }
  }

  public statSync(path: string): Stats {
    try {
      return this.memoryFS.statSync(path);
    } catch (err) {
      return super.statSync(path);
    }
  }
}
