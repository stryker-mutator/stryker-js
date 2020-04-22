import * as path from 'path';

import { StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { RunResult, RunStatus, TestRunner } from '@stryker-mutator/api/test_runner';

import LibWrapper from './LibWrapper';
import { MochaOptions } from './MochaOptions';
import { StrykerMochaReporter } from './StrykerMochaReporter';
import { evalGlobal, mochaOptionsKey } from './utils';

const DEFAULT_TEST_PATTERN = 'test/**/*.js';

export class MochaTestRunner implements TestRunner {
  private testFileNames: string[];
  private readonly mochaOptions: MochaOptions;

  public static inject = tokens(commonTokens.logger, commonTokens.sandboxFileNames, commonTokens.options);
  constructor(private readonly log: Logger, private readonly allFileNames: readonly string[], options: StrykerOptions) {
    this.mochaOptions = options[mochaOptionsKey];
    this.additionalRequires();
    StrykerMochaReporter.log = log;
  }

  public init(): void {
    if (LibWrapper.handleFiles) {
      this.log.debug("Mocha >= 6 detected. Using mocha's `handleFiles` to load files");
      this.testFileNames = this.mocha6DiscoverFiles(LibWrapper.handleFiles);
    } else {
      this.log.debug('Mocha < 6 detected. Using custom logic to discover files');
      this.testFileNames = this.legacyDiscoverFiles();
    }
  }

  private mocha6DiscoverFiles(handleFiles: (options: MochaOptions) => string[]): string[] {
    const originalProcessExit = process.exit;
    try {
      // process.exit unfortunate side effect: https://github.com/mochajs/mocha/blob/07ea8763c663bdd3fe1f8446cdb62dae233f4916/lib/cli/run-helpers.js#L174
      (process as any).exit = () => {};
      const files = handleFiles(this.mochaOptions);
      return files;
    } finally {
      process.exit = originalProcessExit;
    }
  }

  private legacyDiscoverFiles(): string[] {
    const globPatterns = this.mochaFileGlobPatterns();
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
        )}). Please specify the files (glob patterns) containing your tests in ${mochaOptionsKey}.files in your config file.`
      );
    }
    return fileNames;
  }
  private mochaFileGlobPatterns(): string[] {
    // Use both `spec` as `files`
    const globPatterns: string[] = [];
    if (this.mochaOptions.spec) {
      globPatterns.push(...this.mochaOptions.spec);
    }

    if (typeof this.mochaOptions.files === 'string') {
      // `files` if for backward compat
      globPatterns.push(this.mochaOptions.files);
    } else if (this.mochaOptions.files) {
      globPatterns.push(...this.mochaOptions.files);
    }
    if (!globPatterns.length) {
      globPatterns.push(DEFAULT_TEST_PATTERN);
    }
    return globPatterns;
  }

  public run({ testHooks }: { testHooks?: string }): Promise<RunResult> {
    return new Promise<RunResult>((resolve, reject) => {
      try {
        this.purgeFiles();
        const mocha = new LibWrapper.Mocha({ reporter: StrykerMochaReporter as any, bail: true });
        this.configure(mocha);
        this.addTestHooks(mocha, testHooks);
        this.addFiles(mocha);
        try {
          mocha.run(() => {
            const reporter = StrykerMochaReporter.currentInstance;
            if (reporter) {
              const result: RunResult = reporter.runResult;
              resolve(result);
            } else {
              const errorMsg = 'The StrykerMochaReporter was not instantiated properly. Could not retrieve the RunResult.';
              this.log.error(errorMsg);
              resolve({
                errorMessages: [errorMsg],
                status: RunStatus.Error,
                tests: [],
              });
            }
          });
        } catch (error) {
          resolve({
            errorMessages: [error],
            status: RunStatus.Error,
            tests: [],
          });
        }
      } catch (error) {
        this.log.error(error);
        reject(error);
      }
    });
  }

  private purgeFiles() {
    this.allFileNames.forEach((fileName) => delete require.cache[fileName]);
  }

  private addFiles(mocha: Mocha) {
    this.testFileNames.forEach((fileName) => {
      mocha.addFile(fileName);
    });
  }

  private addTestHooks(mocha: Mocha, testHooks: string | undefined): void {
    if (testHooks) {
      const suite = (mocha as any).suite;
      suite.emit('pre-require', global, '', mocha);
      suite.emit('require', evalGlobal(testHooks), '', mocha);
      suite.emit('post-require', global, '', mocha);
    }
  }

  private configure(mocha: Mocha) {
    const options = this.mochaOptions;

    function setIfDefined<T>(value: T | undefined, operation: (input: T) => void) {
      if (typeof value !== 'undefined') {
        operation.apply(mocha, [value]);
      }
    }

    if (options) {
      setIfDefined(options.asyncOnly, mocha.asyncOnly);
      setIfDefined(options.timeout, mocha.timeout);
      setIfDefined(options.ui, mocha.ui);
      setIfDefined(options.grep, mocha.grep);
    }
  }

  private additionalRequires() {
    if (this.mochaOptions.require) {
      const modulesToRequire = this.mochaOptions.require.map((moduleName) => (moduleName.startsWith('.') ? path.resolve(moduleName) : moduleName));
      modulesToRequire.forEach(LibWrapper.require);
    }
  }
}
