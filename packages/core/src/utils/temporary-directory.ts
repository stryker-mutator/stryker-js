import path from 'path';
import { createReadStream, createWriteStream } from 'fs';

import { StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { Disposable } from 'typed-inject';

import { fileUtils } from './file-utils.js';
import { objectUtils } from './object-utils.js';

export class TemporaryDirectory implements Disposable {
  private readonly temporaryDirectory: string;
  private isInitialized = false;
  public removeDuringDisposal: boolean;

  public static readonly inject = tokens(commonTokens.logger, commonTokens.options);
  constructor(private readonly log: Logger, options: StrykerOptions) {
    this.temporaryDirectory = path.resolve(options.tempDirName);
    this.removeDuringDisposal = options.cleanTempDir;
  }

  public async initialize(): Promise<void> {
    this.log.debug('Using temp directory "%s"', this.temporaryDirectory);
    await fileUtils.mkdirp(this.temporaryDirectory);
    this.isInitialized = true;
  }

  public getRandomDirectory(prefix: string): string {
    return path.resolve(this.temporaryDirectory, `${prefix}${objectUtils.random()}`);
  }

  /**
   * Creates a new random directory with the specified prefix.
   * @returns The path to the directory.
   */
  public async createDirectory(name: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('initialize() was not called!');
    }
    await fileUtils.mkdirp(path.resolve(this.temporaryDirectory, name));
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
        await fileUtils.deleteDir(this.temporaryDirectory);
      } catch (e) {
        this.log.info(`Failed to delete stryker temp directory ${this.temporaryDirectory}`);
      }
    }
  }
}
