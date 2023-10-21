import path from 'path';
import fs from 'fs';

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
  constructor(
    private readonly log: Logger,
    options: StrykerOptions,
  ) {
    this.temporaryDirectory = path.resolve(options.tempDirName);
    this.removeDuringDisposal = Boolean(options.cleanTempDir);
  }

  public async initialize(): Promise<void> {
    this.log.debug('Using temp directory "%s"', this.temporaryDirectory);
    await fs.promises.mkdir(this.temporaryDirectory, { recursive: true });
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
    await fs.promises.mkdir(path.resolve(this.temporaryDirectory, name), { recursive: true });
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
