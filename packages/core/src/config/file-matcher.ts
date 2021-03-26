import path from 'path';

import minimatch from 'minimatch';

/**
 * A helper class for matching files using the `disableTypeChecks` setting.
 */
export class FileMatcher {
  private readonly pattern: string | false;

  constructor(pattern: string | false) {
    if (pattern !== false) {
      this.pattern = path.resolve(pattern);
    } else {
      this.pattern = pattern;
    }
  }

  public matches(fileName: string): boolean {
    return !!this.pattern && minimatch(path.resolve(fileName), this.pattern);
  }
}
