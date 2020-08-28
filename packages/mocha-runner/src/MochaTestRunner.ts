import { StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';

import { I, escapeRegExp, DirectoryRequireCache } from '@stryker-mutator/util';

import {
  TestRunner2,
  DryRunResult,
  DryRunOptions,
  MutantRunOptions,
  MutantRunResult,
  DryRunStatus,
  toMutantRunResult,
  CompleteDryRunResult,
} from '@stryker-mutator/api/test_runner';

import { MochaOptions } from '../src-generated/mocha-runner-options';

import { StrykerMochaReporter } from './StrykerMochaReporter';
import { MochaRunnerWithStrykerOptions } from './MochaRunnerWithStrykerOptions';
import * as pluginTokens from './plugin-tokens';
import MochaOptionsLoader from './MochaOptionsLoader';
import { MochaAdapter } from './MochaAdapter';

export class MochaTestRunner implements TestRunner2 {
  public testFileNames: string[];
  public rootHooks: any;
  public mochaOptions!: MochaOptions;

  public static inject = tokens(
    commonTokens.logger,
    commonTokens.options,
    pluginTokens.loader,
    pluginTokens.mochaAdapter,
    pluginTokens.directoryRequireCache
  );
  constructor(
    private readonly log: Logger,
    private readonly options: StrykerOptions,
    private readonly loader: I<MochaOptionsLoader>,
    private readonly mochaAdapter: I<MochaAdapter>,
    private readonly requireCache: I<DirectoryRequireCache>
  ) {
    StrykerMochaReporter.log = log;
  }
  public async init(): Promise<void> {
    this.mochaOptions = this.loader.load(this.options as MochaRunnerWithStrykerOptions);
    this.testFileNames = this.mochaAdapter.collectFiles(this.mochaOptions);
    this.requireCache.init(this.testFileNames);
    if (this.mochaOptions.require) {
      this.rootHooks = await this.mochaAdapter.handleRequires(this.mochaOptions.require);
    }
  }

  public async dryRun(options: DryRunOptions): Promise<DryRunResult> {
    let interceptor: (mocha: Mocha) => void = () => {};
    if (options.coverageAnalysis === 'perTest') {
      interceptor = (mocha) => {
        mocha.suite.beforeEach('StrykerIntercept', function () {
          global.__currentTestId__ = this.currentTest?.fullTitle();
        });
      };
    }
    const runResult = await this.run(interceptor);
    if (runResult.status === DryRunStatus.Complete && options.coverageAnalysis !== 'off') {
      runResult.mutantCoverage = global.__mutantCoverage__;
    }
    return runResult;
  }

  public async mutantRun({ activeMutant, testFilter }: MutantRunOptions): Promise<MutantRunResult> {
    global.__activeMutant__ = activeMutant.id;
    let intercept: (mocha: Mocha) => void = () => {};
    if (testFilter) {
      const metaRegExp = testFilter.map((testId) => `(${escapeRegExp(testId)})`).join('|');
      const regex = new RegExp(metaRegExp);
      intercept = (mocha) => {
        mocha.grep(regex);
      };
    }
    const dryRunResult = await this.run(intercept);
    return toMutantRunResult(dryRunResult);
  }

  public async run(intercept: (mocha: Mocha) => void): Promise<DryRunResult> {
    this.requireCache.clear();
    const mocha = this.mochaAdapter.create({
      reporter: StrykerMochaReporter as any,
      bail: true,
      rootHooks: this.rootHooks,
    } as Mocha.MochaOptions);
    this.configure(mocha);
    intercept(mocha);
    this.addFiles(mocha);
    try {
      await this.runMocha(mocha);
      if ((mocha as any).dispose) {
        // Since mocha 7.2
        (mocha as any).dispose();
      }
      this.requireCache.record();
      const reporter = StrykerMochaReporter.currentInstance;
      if (reporter) {
        const result: CompleteDryRunResult = {
          status: DryRunStatus.Complete,
          tests: reporter.tests,
        };
        return result;
      } else {
        const errorMessage = `Mocha didn't instantiate the ${StrykerMochaReporter.name} correctly. Test result cannot be reported.`;
        this.log.error(errorMessage);
        return {
          status: DryRunStatus.Error,
          errorMessage,
        };
      }
    } catch (errorMessage) {
      return {
        errorMessage,
        status: DryRunStatus.Error,
      };
    }
  }

  private runMocha(mocha: Mocha): Promise<void> {
    return new Promise<void>((res) => {
      mocha.run(() => res());
    });
  }

  private addFiles(mocha: Mocha) {
    this.testFileNames.forEach((fileName) => {
      mocha.addFile(fileName);
    });
  }

  private configure(mocha: Mocha) {
    const options = this.mochaOptions;

    function setIfDefined<T>(value: T | undefined, operation: (input: T) => void) {
      if (typeof value !== 'undefined') {
        operation.apply(mocha, [value]);
      }
    }

    setIfDefined(options['async-only'], (asyncOnly) => asyncOnly && mocha.asyncOnly());
    setIfDefined(options.timeout, mocha.timeout);
    setIfDefined(options.ui, mocha.ui);
    setIfDefined(options.grep, mocha.grep);
  }
}
