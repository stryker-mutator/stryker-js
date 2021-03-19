import path from 'path';

import minimatch from 'minimatch';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { File, StrykerOptions } from '@stryker-mutator/api/core';
import type { disableTypeChecks } from '@stryker-mutator/instrumenter';
import { Logger } from '@stryker-mutator/api/logging';
import { propertyPath, PropertyPathBuilder } from '@stryker-mutator/util';

import { coreTokens } from '../di';
import { isWarningEnabled } from '../utils/object-utils';

import { FilePreprocessor } from './file-preprocessor';

/**
 * Disabled type checking by inserting `@ts-nocheck` atop TS/JS files and removing other @ts-xxx directives from comments:
 * @see https://github.com/stryker-mutator/stryker-js/issues/2438
 */
export class DisableTypeChecksPreprocessor implements FilePreprocessor {
  public static readonly inject = tokens(commonTokens.logger, commonTokens.options, coreTokens.disableTypeChecksHelper);
  constructor(private readonly log: Logger, private readonly options: StrykerOptions, private readonly impl: typeof disableTypeChecks) {}

  public async preprocess(files: File[]): Promise<File[]> {
    if (this.options.disableTypeChecks === false) {
      return files;
    } else {
      const pattern = path.resolve(this.options.disableTypeChecks);
      let warningLogged = false;
      const outFiles = await Promise.all(
        files.map(async (file) => {
          if (minimatch(path.resolve(file.name), pattern)) {
            try {
              return await this.impl(file, { plugins: this.options.mutator.plugins });
            } catch (err) {
              if (isWarningEnabled('preprocessorErrors', this.options.warnings)) {
                warningLogged = true;
                this.log.warn(
                  `Unable to disable type checking for file "${
                    file.name
                  }". Shouldn't type checking be disabled for this file? Consider configuring a more restrictive "${propertyPath<StrykerOptions>(
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
        this.log.warn(
          `(disable "${PropertyPathBuilder.create<StrykerOptions>().prop('warnings').prop('preprocessorErrors')}" to ignore this warning`
        );
      }
      return outFiles;
    }
  }
}
