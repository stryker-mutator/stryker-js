import { InstrumenterContext, INSTRUMENTER_CONSTANTS, StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { I, escapeRegExp, DirectoryRequireCache } from '@stryker-mutator/util';

import {
  TestRunner,
  DryRunResult,
  DryRunOptions,
  MutantRunOptions,
  MutantRunResult,
  DryRunStatus,
  toMutantRunResult,
  CompleteDryRunResult,
  determineHitLimitReached,
} from '@stryker-mutator/api/test-runner';

import { MochaOptions } from '../src-generated/mocha-runner-options';

import { StrykerMochaReporter } from './stryker-mocha-reporter';
import { MochaRunnerWithStrykerOptions } from './mocha-runner-with-stryker-options';
import * as pluginTokens from './plugin-tokens';
import { MochaOptionsLoader } from './mocha-options-loader';
import { MochaAdapter } from './mocha-adapter';

export class MochaTestRunner implements TestRunner {
  public testFileNames?: string[];
  public rootHooks: any;
  public mochaOptions!: MochaOptions;
  private readonly instrumenterContext: InstrumenterContext;

  public static inject = tokens(
    commonTokens.logger,
    commonTokens.options,
    pluginTokens.loader,
    pluginTokens.mochaAdapter,
    pluginTokens.directoryRequireCache,
    pluginTokens.globalNamespace
  );
  constructor(
    private readonly log: Logger,
    private readonly options: StrykerOptions,
    private readonly loader: I<MochaOptionsLoader>,
    private readonly mochaAdapter: I<MochaAdapter>,
    private readonly requireCache: I<DirectoryRequireCache>,
    globalNamespace: typeof INSTRUMENTER_CONSTANTS.NAMESPACE | '__stryker2__'
  ) {
    StrykerMochaReporter.log = log;
    this.instrumenterContext = global[globalNamespace] ?? (global[globalNamespace] = {});
  }
  public async init(): Promise<void> {
    this.mochaOptions = this.loader.load(this.options as MochaRunnerWithStrykerOptions);
    this.testFileNames = this.mochaAdapter.collectFiles(this.mochaOptions);
    if (this.mochaOptions.require) {
      if (this.mochaOptions.require.includes('esm')) {
        throw new Error(
          'Config option "mochaOptions.require" does not support "esm", please use `"testRunnerNodeArgs": ["--require", "esm"]` instead. See https://github.com/stryker-mutator/stryker-js/issues/3014 for more information.'
        );
      }
      this.rootHooks = await this.mochaAdapter.handleRequires(this.mochaOptions.require);
    }
  }

  public async dryRun({ coverageAnalysis, disableBail }: DryRunOptions): Promise<DryRunResult> {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    let interceptor: (mocha: Mocha) => void = () => {};
    if (coverageAnalysis === 'perTest') {
      interceptor = (mocha) => {
        const self = this;
        mocha.suite.beforeEach('StrykerIntercept', function () {
          self.instrumenterContext.currentTestId = this.currentTest?.fullTitle();
        });
      };
    }
    const runResult = await this.run(interceptor, disableBail);
    if (runResult.status === DryRunStatus.Complete && coverageAnalysis !== 'off') {
      runResult.mutantCoverage = this.instrumenterContext.mutantCoverage;
    }
    return runResult;
  }

  public async mutantRun({ activeMutant, testFilter, disableBail, hitLimit }: MutantRunOptions): Promise<MutantRunResult> {
    this.instrumenterContext.activeMutant = activeMutant.id;
    this.instrumenterContext.hitLimit = hitLimit;
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    let intercept: (mocha: Mocha) => void = () => {};
    if (testFilter) {
      const metaRegExp = testFilter.map((testId) => `(${escapeRegExp(testId)})`).join('|');
      const regex = new RegExp(metaRegExp);
      intercept = (mocha) => {
        mocha.grep(regex);
      };
    }
    const dryRunResult = await this.run(intercept, disableBail);
    return toMutantRunResult(dryRunResult, true);
  }

  public async run(intercept: (mocha: Mocha) => void, disableBail: boolean): Promise<DryRunResult> {
    this.requireCache.clear();
    const mocha = this.mochaAdapter.create({
      reporter: StrykerMochaReporter as any,
      bail: !disableBail,
      timeout: false as any, // Mocha 5 doesn't support `0`
      rootHooks: this.rootHooks,
    } as Mocha.MochaOptions);
    this.configure(mocha);
    intercept(mocha);
    this.addFiles(mocha);
    try {
      await this.runMocha(mocha);
      // Call `requireCache.record` before `mocha.dispose`.
      // `Mocha.dispose` already deletes test files from require cache, but its important that they are recorded before that.
      this.requireCache.record();
      if ((mocha as any).dispose) {
        // Since mocha 7.2
        (mocha as any).dispose();
      }
      const reporter = StrykerMochaReporter.currentInstance;
      if (reporter) {
        const timeoutResult = determineHitLimitReached(this.instrumenterContext.hitCount, this.instrumenterContext.hitLimit);
        if (timeoutResult) {
          return timeoutResult;
        }
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
    } catch (errorMessage: any) {
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
    this.testFileNames?.forEach((fileName) => {
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
    setIfDefined(options.ui, mocha.ui);
    setIfDefined(options.grep, mocha.grep);
  }
}
