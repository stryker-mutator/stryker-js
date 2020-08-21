import path = require('path');

import { File, StrykerOptions } from '@stryker-mutator/api/core';
import removeComments = require('strip-comments');
import minimatch = require('minimatch');
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';

import { FilePreprocessor } from './file-preprocessor';

/**
 * Strips comments from files to get around issue: 2364.
 * @see https://github.com/stryker-mutator/stryker/issues/2364
 */
export class StripCommentsPreprocessor implements FilePreprocessor {
  public static readonly inject = tokens(commonTokens.options);

  constructor(private readonly options: StrykerOptions) {}

  public async preprocess(files: File[]): Promise<File[]> {
    if (this.options.sandbox.removeComments === false) {
      return files;
    } else {
      const pattern = path.resolve(this.options.sandbox.removeComments);
      return files.map((file) => {
        if (minimatch(path.resolve(file.name), pattern)) {
          return new File(file.name, removeComments(file.textContent));
        } else {
          return file;
        }
      });
    }
  }
}
