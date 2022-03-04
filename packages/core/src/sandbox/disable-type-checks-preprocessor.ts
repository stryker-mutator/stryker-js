import path from 'path';

import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { File, StrykerOptions } from '@stryker-mutator/api/core';
import type { disableTypeChecks } from '@stryker-mutator/instrumenter';
import { Logger } from '@stryker-mutator/api/logging';

import { optionsPath } from '../utils/index.js';
import { coreTokens } from '../di/index.js';
import { objectUtils } from '../utils/object-utils.js';
import { FileMatcher } from '../config/index.js';

import { FilePreprocessor } from './file-preprocessor.js';

/**
 * Disabled type checking by inserting `@ts-nocheck` atop TS/JS files and removing other @ts-xxx directives from comments:
 * @see https://github.com/stryker-mutator/stryker-js/issues/2438
 */
export class DisableTypeChecksPreprocessor implements FilePreprocessor {
  public static readonly inject = tokens(commonTokens.logger, commonTokens.options, coreTokens.disableTypeChecksHelper);
  constructor(private readonly log: Logger, private readonly options: StrykerOptions, private readonly impl: typeof disableTypeChecks) {}

  public async preprocess(files: File[]): Promise<File[]> {
    const matcher = new FileMatcher(this.options.disableTypeChecks);
    let warningLogged = false;
    const outFiles = await Promise.all(
      files.map(async (file) => {
        if (matcher.matches(path.resolve(file.name))) {
          try {
            return await this.impl(file, { plugins: this.options.mutator.plugins });
          } catch (err) {
            if (objectUtils.isWarningEnabled('preprocessorErrors', this.options.warnings)) {
              warningLogged = true;
              this.log.warn(
                `Unable to disable type checking for file "${
                  file.name
                }". Shouldn't type checking be disabled for this file? Consider configuring a more restrictive "${optionsPath(
                  'disableTypeChecks'
                )}" settings (or turn it completely off with \`false\`)`,
                err
              );
            }
            return file;
          }
        } else {
          return file;
        }
      })
    );
    if (warningLogged) {
      this.log.warn(`(disable "${optionsPath('warnings', 'preprocessorErrors')}" to ignore this warning`);
    }
    return outFiles;
  }
}
