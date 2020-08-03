import path = require('path');
import fs = require('fs');

import { tokens, commonTokens } from '@stryker-mutator/api/plugin';
import { Logger } from '@stryker-mutator/api/logging';
import { propertyPath } from '@stryker-mutator/util';

import { MochaOptions, MochaRunnerOptions } from '../src-generated/mocha-runner-options';

import LibWrapper from './LibWrapper';
import { MochaTestRunner } from './MochaTestRunner';

const DEFAULT_TEST_PATTERN = 'test/**/*.js';

/**
 * A class that contains polyfills for different versions of mocha.
 * Tries to mimic the functionality of mocha's latest api.
 *
 * Currently supports mocha < 6
 */
export class MochaAdapter {
  public static readonly inject = tokens(commonTokens.logger, commonTokens.sandboxFileNames);

  constructor(private readonly log: Logger, private readonly allFileNames: readonly string[]) {}

  public create(options: Mocha.MochaOptions) {
    return new LibWrapper.Mocha(options);
  }

  public collectFiles(options: MochaOptions): string[] {
    if (LibWrapper.collectFiles) {
      this.log.debug("Mocha >= 6 detected. Using mocha's `collectFiles` to load files");
      return this.mocha6DiscoverFiles(options);
    } else {
      this.log.debug('Mocha < 6 detected. Using custom logic to discover files');
      return this.legacyDiscoverFiles(options);
    }
  }

  public async handleRequires(requires: string[]): Promise<any> {
    if (LibWrapper.handleRequires) {
      const rawRootHooks = await LibWrapper.handleRequires(requires);
      if (rawRootHooks) {
        return await LibWrapper.loadRootHooks!(rawRootHooks);
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
      modulesToRequire.forEach(LibWrapper.require);
    }
  }

  private mocha6DiscoverFiles(options: MochaOptions): string[] {
    const originalProcessExit = process.exit;
    try {
      // process.exit unfortunate side effect: https://github.com/mochajs/mocha/blob/07ea8763c663bdd3fe1f8446cdb62dae233f4916/lib/cli/run-helpers.js#L174
      (process as any).exit = () => {};
      const files = LibWrapper.collectFiles!(options);
      return files;
    } finally {
      process.exit = originalProcessExit;
    }
  }

  private legacyDiscoverFiles(options: MochaOptions): string[] {
    const globPatterns = this.mochaFileGlobPatterns(options);
    const globPatternsAbsolute = globPatterns.map((glob) => path.resolve(glob));
    const fileNames = LibWrapper.multimatch(this.allFileNames.slice(), globPatternsAbsolute);
    if (fileNames.length) {
      this.log.debug(`Using files: ${JSON.stringify(fileNames, null, 2)}`);
    } else {
      this.log.debug(`Tried ${JSON.stringify(globPatternsAbsolute, null, 2)} on files: ${JSON.stringify(this.allFileNames, null, 2)}.`);
      throw new Error(
        `[${MochaTestRunner.name}] No files discovered (tried pattern(s) ${JSON.stringify(
          globPatterns,
          null,
          2
        )}). Please specify the files (glob patterns) containing your tests in ${propertyPath<MochaRunnerOptions>(
          'mochaOptions',
          'spec'
        )} in your config file.`
      );
    }
    return fileNames;
  }

  private mochaFileGlobPatterns(mochaOptions: MochaOptions): string[] {
    // Use both `spec` as `files`
    const globPatterns: string[] = [];
    if (mochaOptions.spec) {
      globPatterns.push(...mochaOptions.spec);
    }

    if (typeof mochaOptions.files === 'string') {
      // `files` if for backward compat
      globPatterns.push(mochaOptions.files);
    } else if (mochaOptions.files) {
      globPatterns.push(...mochaOptions.files);
    }
    if (!globPatterns.length) {
      globPatterns.push(DEFAULT_TEST_PATTERN);
    }
    return globPatterns;
  }
}
