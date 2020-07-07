import { StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { RunResult, RunStatus, TestRunner } from '@stryker-mutator/api/test_runner';

import { I } from '@stryker-mutator/util';

import { MochaOptions } from '../src-generated/mocha-runner-options';

import { StrykerMochaReporter } from './StrykerMochaReporter';
import { evalGlobal } from './utils';
import { MochaRunnerWithStrykerOptions } from './MochaRunnerWithStrykerOptions';
import * as pluginTokens from './plugin-tokens';
import MochaOptionsLoader from './MochaOptionsLoader';
import { MochaAdapter } from './MochaAdapter';

export class MochaTestRunner implements TestRunner {
  public testFileNames: string[];
  public rootHooks: any;
  public mochaOptions!: MochaOptions;

  public static inject = tokens(
    commonTokens.logger,
    commonTokens.sandboxFileNames,
    commonTokens.options,
    pluginTokens.loader,
    pluginTokens.mochaAdapter
  );
  constructor(
    private readonly log: Logger,
    private readonly allFileNames: readonly string[],
    private readonly options: StrykerOptions,
    private readonly loader: I<MochaOptionsLoader>,
    private readonly mochaAdapter: I<MochaAdapter>
  ) {
    StrykerMochaReporter.log = log;
  }

  public async init(): Promise<void> {
    this.mochaOptions = this.loader.load(this.options as MochaRunnerWithStrykerOptions);
    this.testFileNames = this.mochaAdapter.collectFiles(this.mochaOptions);
    if (this.mochaOptions.require) {
      this.rootHooks = await this.mochaAdapter.handleRequires(this.mochaOptions.require);
    }
  }

  public run({ testHooks }: { testHooks?: string }): Promise<RunResult> {
    return new Promise<RunResult>((resolve, reject) => {
      try {
        this.purgeFiles();
        const mocha = this.mochaAdapter.create({
          reporter: StrykerMochaReporter as any,
          bail: true,
          rootHooks: this.rootHooks,
        } as Mocha.MochaOptions);
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
      setIfDefined(options['async-only'], (asyncOnly) => asyncOnly && mocha.asyncOnly());
      setIfDefined(options.timeout, mocha.timeout);
      setIfDefined(options.ui, mocha.ui);
      setIfDefined(options.grep, mocha.grep);
    }
  }
}
