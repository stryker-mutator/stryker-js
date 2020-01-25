import * as os from 'os';

import { tokens } from '@stryker-mutator/api/plugin';
import { fsAsPromised } from '@stryker-mutator/util';
import { defaultTempDirName } from '@stryker-mutator/api/config';

import { initializerTokens } from '.';

const GITIGNORE_FILE = '.gitignore';

export default class GitignoreWriter {
  public static inject = tokens(initializerTokens.out);
  constructor(private readonly out: typeof console.log) {}

  public async addStrykerTempFolder() {
    if (fsAsPromised.existsSync(GITIGNORE_FILE)) {
      const gitignoreContent = await fsAsPromised.readFile(GITIGNORE_FILE);
      if (!gitignoreContent.toString().includes(defaultTempDirName)) {
        const strykerTempFolderSpecification = `${os.EOL}# stryker temp files${os.EOL}${defaultTempDirName}${os.EOL}`;
        await fsAsPromised.appendFile(GITIGNORE_FILE, strykerTempFolderSpecification);
        this.out('Note: Your .gitignore file has been updated to include recommended git ignore patterns for Stryker');
      }
    } else {
      this.out('No .gitignore file could be found. Please add the following to your .gitignore file: *.stryker-tmp');
    }
  }
}
