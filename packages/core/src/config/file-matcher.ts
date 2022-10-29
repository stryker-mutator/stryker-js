import path from 'path';

import minimatch from 'minimatch';
import { normalizeFileName } from '@stryker-mutator/util';

/**
 * A helper class for matching files using the `disableTypeChecks` setting.
 */
export class FileMatcher {
  private readonly pattern: boolean | string;

  constructor(pattern: boolean | string) {
    if (typeof pattern === 'string') {
      this.pattern = normalizeFileName(path.resolve(pattern));
    } else {
      this.pattern = pattern;
    }
  }

  public matches(fileName: string): boolean {
    if (typeof this.pattern === 'string') {
      return minimatch(normalizeFileName(path.resolve(fileName)), this.pattern);
    } else {
      return this.pattern;
    }
  }
}
