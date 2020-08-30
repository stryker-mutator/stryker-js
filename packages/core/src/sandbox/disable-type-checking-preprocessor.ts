import path = require('path');

import minimatch = require('minimatch');
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { File, StrykerOptions } from '@stryker-mutator/api/core';

import { disableTypeChecking } from '@stryker-mutator/instrumenter';

import { FilePreprocessor } from './file-preprocessor';

/**
 * Disabled type checking by inserting `@ts-nocheck` atop TS/JS files and removing other @ts-xxx directives from comments:
 * @see https://github.com/stryker-mutator/stryker/issues/2438
 */
export class DisableTypeCheckingPreprocessor implements FilePreprocessor {
  public static readonly inject = tokens(commonTokens.options);
  constructor(private readonly options: StrykerOptions) {}

  public async preprocess(files: File[]): Promise<File[]> {
    if (this.options.sandbox.disableTypeChecking === false) {
      return files;
    } else {
      const pattern = path.resolve(this.options.sandbox.disableTypeChecking);
      return Promise.all(
        files.map(async (file) => {
          if (minimatch(path.resolve(file.name), pattern)) {
            return await disableTypeChecking(file, { plugins: this.options.mutator.plugins });
          } else {
            return file;
          }
        })
      );
    }
  }
}
