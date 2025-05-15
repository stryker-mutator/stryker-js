import os from 'os';
import { existsSync, promises as fs } from 'fs';

import { tokens } from '@stryker-mutator/api/plugin';

import { defaultOptions } from '../config/index.js';

import { initializerTokens } from './index.js';

const GITIGNORE_FILE = '.gitignore';

export class GitignoreWriter {
  public static inject = tokens(initializerTokens.out);
  constructor(private readonly out: typeof console.log) {}

  public async addStrykerTempFolder(): Promise<void> {
    const defaultTempDirName = defaultOptions.tempDirName;
    if (existsSync(GITIGNORE_FILE)) {
      const gitignoreContent = await fs.readFile(GITIGNORE_FILE);
      if (!gitignoreContent.toString().includes(defaultTempDirName)) {
        const strykerTempFolderSpecification = `${os.EOL}# stryker temp files${os.EOL}${defaultTempDirName}${os.EOL}`;
        await fs.appendFile(GITIGNORE_FILE, strykerTempFolderSpecification);
        this.out(
          'Note: Your .gitignore file has been updated to include recommended git ignore patterns for Stryker',
        );
      }
    } else {
      this.out(
        'No .gitignore file could be found. Please add the following to your .gitignore file: *.stryker-tmp',
      );
    }
  }
}
