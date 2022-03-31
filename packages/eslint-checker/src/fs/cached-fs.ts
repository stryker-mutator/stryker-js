import fs from 'fs/promises';

import { Logger } from '@stryker-mutator/api/logging';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';

import { ScriptFile } from './script-file.js';

export class CachedFs {
  private readonly files = new Map<string, ScriptFile | undefined>();

  public static inject = tokens(commonTokens.logger);
  constructor(private readonly log: Logger) {}

  private async readRawFile(fileName: string): Promise<ScriptFile> {
    this.log.debug(`reading file ${fileName}`);
    const content = await fs.readFile(fileName, { encoding: 'utf-8' });
    const file = new ScriptFile(content, fileName);
    this.files.set(fileName, file);
    return file;
  }

  public async getFile(fileName: string): Promise<ScriptFile> {
    const cached = this.files.get(fileName);
    if (cached) {
      this.log.trace('using file from cache');
      return cached;
    }

    return this.readRawFile(fileName);
  }
}
