import { File } from 'stryker-api/core';
import { Logger } from 'stryker-api/logging';
import { normalizeWhiteSpaces } from '../utils/objectUtils';

export default class InputFileCollection {
  public readonly files: ReadonlyArray<File>;
  public readonly filesToMutate: ReadonlyArray<File>;

  constructor(files: ReadonlyArray<File>, mutateGlobResult: ReadonlyArray<string>) {
    this.files = files;
    this.filesToMutate = files.filter(file => mutateGlobResult.some(name => name === file.name));
  }

  logFiles(log: Logger) {
    if (!this.files.length) {
      log.warn(normalizeWhiteSpaces(`
        No files selected. Please make sure you either run stryker a git repository context (and don't specify \`files\` in your stryker.conf.js file),
        or specify the \`files\` property in your stryker config.`));
    } else {
      if (this.filesToMutate.length) {
        log.info(`Found ${this.filesToMutate.length} of ${this.files.length} file(s) to be mutated.`);
      } else {
        log.warn(`No files marked to be mutated, stryker will perform a dry-run without actually mutating anything.`);
      }
      if (log.isDebugEnabled) {
        log.debug(`All input files: ${JSON.stringify(this.files.map(file => file.name), null, 2)}`);
        log.debug(`Files to mutate: ${JSON.stringify(this.filesToMutate.map(file => file.name), null, 2)}`);
      }
    }
  }
}
