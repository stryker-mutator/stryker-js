import * as path from 'path';

import { StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { fsAsPromised } from '@stryker-mutator/util';
import * as mkdirp from 'mkdirp';
import { Disposable } from 'typed-inject';

import { deleteDir } from './fileUtils';

export class TemporaryDirectory implements Disposable {
  private readonly temporaryDirectory: string;
  private isInitialized = false;

  public static readonly inject = tokens(commonTokens.logger, commonTokens.options);
  constructor(private readonly log: Logger, options: StrykerOptions) {
    this.temporaryDirectory = path.resolve(options.tempDirName);
  }

  public initialize() {
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
    const dir = path.resolve(this.temporaryDirectory, `${prefix}${this.random()}`);
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
      let readStream: NodeJS.ReadableStream = fsAsPromised.createReadStream(fromFilename, { encoding: 'utf8' });
      const writeStream = fsAsPromised.createWriteStream(toFilename);
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
  public async dispose() {
    if (!this.isInitialized) {
      throw new Error('initialize() was not called!');
    }
    this.log.debug('Deleting stryker temp directory %s', this.temporaryDirectory);
    try {
      await deleteDir(this.temporaryDirectory);
    } catch (e) {
      return this.log.info(`Failed to delete stryker temp directory ${this.temporaryDirectory}`);
    }
  }

  /**
   * Creates a random integer number.
   * @returns A random integer.
   */
  public random(): number {
    return Math.ceil(Math.random() * 10000000);
  }
}
