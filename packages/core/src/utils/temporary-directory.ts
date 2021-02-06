import path from 'path';
import { createReadStream, createWriteStream } from 'fs';

import { StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import mkdirp from 'mkdirp';
import { Disposable } from 'typed-inject';

import { deleteDir } from './file-utils';
import { random } from './object-utils';

export class TemporaryDirectory implements Disposable {
  private readonly temporaryDirectory: string;
  private isInitialized = false;
  public removeDuringDisposal: boolean;

  public static readonly inject = tokens(commonTokens.logger, commonTokens.options);
  constructor(private readonly log: Logger, options: StrykerOptions) {
    this.temporaryDirectory = path.resolve(options.tempDirName);
    this.removeDuringDisposal = options.cleanTempDir;
  }

  public initialize(): void {
    this.isInitialized = true;
    this.log.debug('Using temp directory "%s"', this.temporaryDirectory);
    mkdirp.sync(this.temporaryDirectory);
  }

  /**
   * Creates a new random directory with the specified prefix.
   * @param prefix The prefix.
   * @returns The path to the directory.
   */
  public createRandomDirectory(prefix: string): string {
    if (!this.isInitialized) {
      throw new Error('initialize() was not called!');
    }
    const dir = path.resolve(this.temporaryDirectory, `${prefix}${random()}`);
    mkdirp.sync(dir);
    return dir;
  }

  /**
   * Copies a file.
   * @param fromFilename The path to the existing file.
   * @param toFilename The path to copy the file to.
   * @param instrumenter An optional additional instrumenter to stream the file through
   * @returns A promise to eventually copy the file.
   */
  public copyFile(fromFilename: string, toFilename: string, instrumenter: NodeJS.ReadWriteStream | null): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let readStream: NodeJS.ReadableStream = createReadStream(fromFilename, { encoding: 'utf8' });
      const writeStream = createWriteStream(toFilename);
      readStream.on('error', reject);
      writeStream.on('error', reject);
      if (instrumenter) {
        readStream = readStream.pipe(instrumenter);
      }
      readStream.pipe(writeStream);
      readStream.on('end', () => resolve());
    });
  }

  /**
   * Deletes the Stryker-temp directory
   */
  public async dispose(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('initialize() was not called!');
    }
    if (this.removeDuringDisposal) {
      this.log.debug('Deleting stryker temp directory %s', this.temporaryDirectory);
      try {
        await deleteDir(this.temporaryDirectory);
      } catch (e) {
        this.log.info(`Failed to delete stryker temp directory ${this.temporaryDirectory}`);
      }
    }
  }
}
