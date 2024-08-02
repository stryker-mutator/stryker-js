import path from 'path';
import fs from 'fs';

import { tokens, commonTokens } from '@stryker-mutator/api/plugin';
import { Logger } from '@stryker-mutator/api/logging';
import { RootHookObject } from 'mocha';

import { MochaOptions } from '../src-generated/mocha-runner-options.js';

import { LibWrapper } from './lib-wrapper.js';

/**
 * A class that contains polyfills for different versions of mocha.
 * Tries to mimic the functionality of mocha's latest api.
 *
 * Currently supports mocha < 6
 */
export class MochaAdapter {
  public static readonly inject = tokens(commonTokens.logger);

  constructor(private readonly log: Logger) {}

  public create(options: Mocha.MochaOptions): Mocha {
    return new LibWrapper.Mocha(options);
  }

  public collectFiles(options: MochaOptions): string[] {
    const originalProcessExit = process.exit;
    try {
      // process.exit unfortunate side effect: https://github.com/mochajs/mocha/blob/07ea8763c663bdd3fe1f8446cdb62dae233f4916/lib/cli/run-helpers.js#L174

      (process as any).exit = () => {};
      const files = LibWrapper.collectFiles!(options);
      if (Array.isArray(files)) {
        return files;
      } else {
        return files.files;
      }
    } finally {
      process.exit = originalProcessExit;
    }
  }

  public async handleRequires(requires: string[]): Promise<RootHookObject | undefined> {
    this.log.trace('Resolving requires %s', requires);
    if (LibWrapper.handleRequires) {
      this.log.trace('Using `handleRequires`');
      const rawRootHooks = await LibWrapper.handleRequires(requires);
      if (rawRootHooks) {
        if (LibWrapper.loadRootHooks) {
          // `loadRootHooks` made a brief appearance in mocha 8, removed in mocha 8.2
          return await LibWrapper.loadRootHooks(rawRootHooks);
        } else {
          return (rawRootHooks as { rootHooks: RootHookObject }).rootHooks;
        }
      }
    } else {
      const modulesToRequire = requires.map((moduleName) => {
        const maybeSetupFileName = path.resolve(moduleName);
        if (fs.existsSync(maybeSetupFileName)) {
          return maybeSetupFileName;
        } else {
          return moduleName;
        }
      });
      this.log.trace('Requiring %s manually', modulesToRequire);
      modulesToRequire.forEach(LibWrapper.require);
    }
    return undefined;
  }
}
