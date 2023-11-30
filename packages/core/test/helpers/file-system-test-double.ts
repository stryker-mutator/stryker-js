import { Dirent, PathLike } from 'fs';

import { FileDescriptions, MutateDescription } from '@stryker-mutator/api/core';
import { factory } from '@stryker-mutator/test-helpers';
import { I } from '@stryker-mutator/util';

import { FileSystem } from '../../src/fs/index.js';

import { createDirent } from './producers.js';

type Param<TMethod extends keyof I<FileSystem>, n extends number> = Parameters<FileSystem[TMethod]>[n];

/**
 * A test double for the file system.
 * Only supports sync, in-memory, text files.
 */
export class FileSystemTestDouble implements I<FileSystem> {
  public dirs = new Set<string>();
  constructor(public readonly files: Record<string, string> = Object.create(null)) {}
  public async dispose(): Promise<void> {
    // Idle, nothing to do here
  }

  public async readFile(fileName: Param<'readFile', 0>): Promise<any> {
    if (typeof fileName !== 'string') {
      this.throwNotSupported();
    }
    const file = this.files[fileName];
    if (file === undefined) {
      throw factory.fileNotFoundError();
    }
    return file;
  }

  public async copyFile(src: Param<'copyFile', 0>, dest: Param<'copyFile', 1>): Promise<void> {
    if (typeof src !== 'string' || typeof dest !== 'string') {
      this.throwNotSupported();
    }
    if (this.files[src] === undefined) {
      throw factory.fileNotFoundError();
    }
    this.files[dest] = this.files[src];
  }

  public async writeFile(name: Param<'writeFile', 0>, data: Param<'writeFile', 1>): Promise<void> {
    if (typeof name !== 'string' || typeof data !== 'string') {
      this.throwNotSupported();
    }
    this.files[name] = data;
  }

  public async mkdir(path: PathLike): Promise<any> {
    this.dirs.add(path.toString());
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public async readdir(path: Param<'readdir', 0>, options?: any): Promise<any> {
    if (!options?.withFileTypes) {
      this.throwNotSupported();
    }
    const dirName = String(path);
    const dirents: Dirent[] = Object.keys(this.files)
      .filter((file) => file.startsWith(dirName))
      .map((fileName) => {
        const filePath = fileName
          .substring(dirName.length)
          .split(/[\/\\]/)
          .filter(Boolean);
        const [name] = filePath;
        const isDirectory = filePath.length > 1;
        return createDirent({ name, isDirectory });
      });
    return dirents;
  }

  private throwNotSupported(): never {
    throw new Error('Not supported');
  }

  /**
   * Creates file descriptions for each file in this test double
   */
  public toFileDescriptions(mutate: MutateDescription = true): FileDescriptions {
    return Object.keys(this.files).reduce<FileDescriptions>((files, fileName) => {
      files[fileName] = { mutate };
      return files;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    }, Object.create(null));
  }
}
