import path = require('path');

import { File, StrykerOptions } from '@stryker-mutator/api/core';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';
import minimatch = require('minimatch');

import { FilePreprocessor } from './file-preprocessor';

/**
 * https://github.com/stryker-mutator/stryker/issues/2276
 */
export class FileHeaderPreprocessor implements FilePreprocessor {
  public static readonly inject = tokens(commonTokens.options);

  constructor(private readonly options: StrykerOptions) {}

  public async preprocess(files: File[]): Promise<File[]> {
    return files.map((file) => {
      if (this.options.sandbox.ignorePatterns.some((pattern) => minimatch(path.resolve(file.name), path.resolve(pattern)))) return file;
      Object.entries(this.options.sandbox.addHeaders).forEach(([pattern, header]) => {
        if (minimatch(path.resolve(file.name), path.resolve(pattern))) {
          file = new File(file.name, `${header}${file.textContent}`);
        }
      });
      return file;
    });
  }
}
