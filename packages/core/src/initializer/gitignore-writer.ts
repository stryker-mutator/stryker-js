import os from 'os';
import { existsSync, promises as fs } from 'fs';

import { tokens } from '@stryker-mutator/api/plugin';

import { defaultOptions } from '../config/index.js';
import { incrementalGitignorePattern } from '../fs/incremental-journal.js';

import { initializerTokens } from './index.js';

const GITIGNORE_FILE = '.gitignore';

/**
 * Appends recommended Stryker ignore patterns to `.gitignore` during `stryker init`.
 * Always includes the temp dir and the default incremental report glob (json, pending WAL, tmp),
 * even when incremental is not enabled yet.
 */
export class GitignoreWriter {
  public static inject = tokens(initializerTokens.out);
  constructor(private readonly out: typeof console.log) {}

  public async addStrykerTempFolder(): Promise<void> {
    const patterns = this.gitignorePatterns();
    if (existsSync(GITIGNORE_FILE)) {
      const gitignoreContent = (await fs.readFile(GITIGNORE_FILE)).toString();
      const missing = patterns.filter(
        (pattern) => !gitignoreContent.includes(pattern),
      );
      if (missing.length === 0) {
        return;
      }
      const header =
        missing.length === patterns.length
          ? `${os.EOL}# stryker${os.EOL}`
          : os.EOL;
      await fs.appendFile(
        GITIGNORE_FILE,
        `${header}${missing.join(os.EOL)}${os.EOL}`,
      );
      this.out(
        'Note: Your .gitignore file has been updated to include recommended git ignore patterns for Stryker',
      );
    } else {
      this.out(
        `No .gitignore file could be found. Please add the following to your .gitignore file: ${patterns.join(', ')}`,
      );
    }
  }

  private gitignorePatterns(): string[] {
    return [
      defaultOptions.tempDirName,
      incrementalGitignorePattern(defaultOptions.incrementalFile),
    ];
  }
}
