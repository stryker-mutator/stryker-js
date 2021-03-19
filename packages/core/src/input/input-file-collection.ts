import os from 'os';

import { File, MutationRange } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { normalizeWhitespaces } from '@stryker-mutator/util';

export class InputFileCollection {
  public readonly files: readonly File[];
  public readonly filesToMutate: readonly File[];
  public readonly mutationRanges: readonly MutationRange[];

  constructor(files: readonly File[], mutateGlobResult: readonly string[], mutationRangeToInstrument: readonly MutationRange[]) {
    this.files = files;
    this.filesToMutate = files.filter((file) => mutateGlobResult.some((name) => name === file.name));
    this.mutationRanges = mutationRangeToInstrument;
  }

  public logFiles(log: Logger): void {
    if (!this.files.length) {
      log.warn(
        `No files selected. Please make sure you either${os.EOL}` +
          ` (1) Run Stryker inside a Git repository; or${os.EOL}` +
          ' (2) Specify the `files` property in your Stryker configuration (`--files via command line`).'
      );
    } else {
      if (this.filesToMutate.length) {
        log.info(`Found ${this.filesToMutate.length} of ${this.files.length} file(s) to be mutated.`);
      } else {
        log.warn(
          normalizeWhitespaces(`No files marked to be mutated, Stryker will perform a dry-run without actually mutating anything.
        You can configure the \`mutate\` property in your config file (or use \`--mutate\` via command line).`)
        );
      }
      if (log.isDebugEnabled()) {
        log.debug(
          `All input files: ${JSON.stringify(
            this.files.map((file) => file.name),
            null,
            2
          )}`
        );
        log.debug(
          `Files to mutate: ${JSON.stringify(
            this.filesToMutate.map((file) => file.name),
            null,
            2
          )}`
        );
      }
    }
  }
}
