import path from 'path';

import { Minimatch } from 'minimatch';
import { normalizeFileName } from '@stryker-mutator/util';

/**
 * A helper class for matching files using the `disableTypeChecks` setting.
 */
export class FileMatcher {
  private readonly matcher: Minimatch | boolean;

  constructor(pattern: boolean | string, allowHiddenFiles = true) {
    if (typeof pattern === 'string') {
      this.matcher = new Minimatch(normalizeFileName(path.resolve(pattern)), {
        dot: allowHiddenFiles,
      });
    } else if (pattern) {
      this.matcher = new Minimatch(
        '**/*.{js,ts,jsx,tsx,html,vue,mjs,mts,cts,cjs}',
        { dot: allowHiddenFiles },
      );
    } else {
      this.matcher = pattern;
    }
  }

  public matches(fileName: string): boolean {
    if (typeof this.matcher === 'boolean') {
      return this.matcher;
    }
    return this.matcher.match(normalizeFileName(path.resolve(fileName)));
  }
}
