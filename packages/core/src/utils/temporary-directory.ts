import path from 'path';
import fs from 'fs';

import { StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { Disposable } from 'typed-inject';

export class TemporaryDirectory implements Disposable {
  #temporaryDirectory?: string;
  public removeDuringDisposal: boolean;

  public static readonly inject = tokens(
    commonTokens.logger,
    commonTokens.options,
  );
  constructor(
    private readonly log: Logger,
    private readonly options: StrykerOptions,
  ) {
    this.removeDuringDisposal = Boolean(options.cleanTempDir);
  }

  public async initialize(): Promise<void> {
    const parent = path.resolve(this.options.tempDirName);
    await fs.promises.mkdir(parent, { recursive: true });
    this.#temporaryDirectory = await fs.promises.mkdtemp(
      path.join(parent, this.options.inPlace ? 'backup-' : 'sandbox-'),
    );
    this.log.debug('Using temp directory "%s"', this.#temporaryDirectory);
  }

  get path() {
    if (!this.#temporaryDirectory) {
      this.#throwNotInitialized();
    }
    return this.#temporaryDirectory;
  }

  #throwNotInitialized(): never {
    throw new Error('initialize() was not called!');
  }

  /**
   * Deletes the Stryker-temp directory
   */
  public async dispose(): Promise<void> {
    if (this.removeDuringDisposal && this.#temporaryDirectory) {
      this.log.debug(
        'Deleting stryker temp directory %s',
        this.#temporaryDirectory,
      );
      try {
        await fs.promises.rm(this.#temporaryDirectory, {
          recursive: true,
          force: true,
        });
      } catch {
        this.log.info(
          `Failed to delete stryker temp directory ${this.#temporaryDirectory}`,
        );
      }
      try {
        const lingeringDirectories = await fs.promises.readdir(
          this.options.tempDirName,
        );
        if (!lingeringDirectories.length) {
          try {
            await fs.promises.rmdir(this.options.tempDirName);
          } catch (e) {
            // It's not THAT important, maybe another StrykerJS process started in the meantime.
            this.log.debug(
              `Failed to clean temp ${path.basename(this.options.tempDirName)}`,
              e,
            );
          }
        }
      } catch {
        // Can safely be ignored, the parent directory doesn't exist
      }
    }
  }
}
