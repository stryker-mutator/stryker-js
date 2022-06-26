import path from 'path';

import minimatch from 'minimatch';

/**
 * A helper class for matching files using the `disableTypeChecks` setting.
 */
export class FileMatcher {
  private readonly pattern: string | false;

  constructor(pattern: string | false) {
    if (pattern !== false) {
      this.pattern = toPosixFileName(path.resolve(pattern));
    } else {
      this.pattern = pattern;
    }
  }

  public matches(fileName: string): boolean {
    return !!this.pattern && minimatch(toPosixFileName(path.resolve(fileName)), this.pattern);
  }
}

/**
 * Replaces backslashes with forward slashes. Minimatch only uses forward slashes
 * @see https://github.com/isaacs/minimatch#windows
 * @param fileName The file name that may contain backslashes `\`
 * @returns posix and ts complaint file name (with `/`)
 */
export function toPosixFileName(fileName: string): string {
  return fileName.replace(/\\/g, '/');
}
