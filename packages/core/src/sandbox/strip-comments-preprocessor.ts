import path from 'path';

import { File, StrykerOptions } from '@stryker-mutator/api/core';
import stripComments from 'strip-comments';
import minimatch from 'minimatch';
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
    if (this.options.sandbox.stripComments === false) {
      return files;
    } else {
      const pattern = path.resolve(this.options.sandbox.stripComments);
      return files.map((file) => {
        if (minimatch(path.resolve(file.name), pattern)) {
          return new File(file.name, stripComments(file.textContent));
        } else {
          return file;
        }
      });
    }
  }
}
