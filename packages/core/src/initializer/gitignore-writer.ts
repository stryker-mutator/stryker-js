import os from 'os';
import { existsSync, promises as fs } from 'fs';

import { tokens } from '@stryker-mutator/api/plugin';

import { defaultOptions } from '../config/index.js';

import { initializerTokens } from './index.js';

const GITIGNORE_FILE = '.gitignore';

interface GitignoreEntry {
  comment: string;
  path: string;
}

export class GitignoreWriter {
  public static inject = tokens(initializerTokens.out);
  constructor(private readonly out: typeof console.log) {}

  public async addStrykerTempFolder(): Promise<void> {
    const entries: GitignoreEntry[] = [
      { comment: 'stryker temp files', path: defaultOptions.tempDirName },
      { comment: 'stryker reports', path: 'reports/' },
    ];
    if (existsSync(GITIGNORE_FILE)) {
      const gitignoreContent = (await fs.readFile(GITIGNORE_FILE)).toString();
      const missing = entries.filter(
        (entry) => !gitignoreContent.includes(entry.path),
      );
      if (missing.length > 0) {
        const specification = missing
          .map(
            (entry) =>
              `${os.EOL}# ${entry.comment}${os.EOL}${entry.path}${os.EOL}`,
          )
          .join('');
        await fs.appendFile(GITIGNORE_FILE, specification);
        this.out(
          'Note: Your .gitignore file has been updated to include recommended git ignore patterns for Stryker',
        );
      }
    } else {
      const paths = entries.map((entry) => entry.path).join(', ');
      this.out(
        `No .gitignore file could be found. Please add the following to your .gitignore file: ${paths}`,
      );
    }
  }
}
