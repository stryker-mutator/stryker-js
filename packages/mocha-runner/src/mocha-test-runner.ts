import { InstrumenterContext, INSTRUMENTER_CONSTANTS, StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { I, escapeRegExp } from '@stryker-mutator/util';

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
  TestRunnerCapabilities,
} from '@stryker-mutator/api/test-runner';

import { Context, RootHookObject, Suite } from 'mocha';

import { StrykerMochaReporter } from './stryker-mocha-reporter';
import { MochaRunnerWithStrykerOptions } from './mocha-runner-with-stryker-options';
import * as pluginTokens from './plugin-tokens';
import { MochaOptionsLoader } from './mocha-options-loader';
import { MochaAdapter } from './mocha-adapter';

export class MochaTestRunner implements TestRunner {
  private mocha!: Mocha;
  private readonly instrumenterContext: InstrumenterContext;
  private originalGrep?: string;
  public beforeEach?: (context: Context) => void;

  public static inject = tokens(
    commonTokens.logger,
    commonTokens.options,
    pluginTokens.loader,
    pluginTokens.mochaAdapter,
    pluginTokens.globalNamespace
  );
  constructor(
    private readonly log: Logger,
    private readonly options: StrykerOptions,
    private readonly loader: I<MochaOptionsLoader>,
    private readonly mochaAdapter: I<MochaAdapter>,
    globalNamespace: typeof INSTRUMENTER_CONSTANTS.NAMESPACE | '__stryker2__'
  ) {
    StrykerMochaReporter.log = log;
    this.instrumenterContext = global[globalNamespace] ?? (global[globalNamespace] = {});
  }

  public async capabilities(): Promise<TestRunnerCapabilities> {
    return {
      // Mocha directly uses `import`, so reloading files once they are loaded is impossible
      reloadEnvironment: false,
    };
  }

  public async init(): Promise<void> {
    const mochaOptions = this.loader.load(this.options as MochaRunnerWithStrykerOptions);
    const testFileNames = this.mochaAdapter.collectFiles(mochaOptions);
    let rootHooks: RootHookObject | undefined;
    if (mochaOptions.require) {
      if (mochaOptions.require.includes('esm')) {
        throw new Error(
          'Config option "mochaOptions.require" does not support "esm", please use `"testRunnerNodeArgs": ["--require", "esm"]` instead. See https://github.com/stryker-mutator/stryker-js/issues/3014 for more information.'
        );
      }
      rootHooks = await this.mochaAdapter.handleRequires(mochaOptions.require);
    }
    this.mocha = this.mochaAdapter.create({
      reporter: StrykerMochaReporter as any,
      timeout: false as any, // Mocha 5 doesn't support `0`
      rootHooks,
    });
    // @ts-expect-error
    this.mocha.cleanReferencesAfterRun(false);
    testFileNames.forEach((fileName) => this.mocha.addFile(fileName));

    this.setIfDefined(mochaOptions['async-only'], (asyncOnly) => asyncOnly && this.mocha.asyncOnly());
    this.setIfDefined(mochaOptions.ui, this.mocha.ui);
    this.setIfDefined(mochaOptions.grep, this.mocha.grep);
    this.originalGrep = mochaOptions.grep;

    // Bind beforeEach, so we can use that for per code coverage in dry run
    const self = this;
    this.mocha.suite.beforeEach(function (this: Context) {
      self.beforeEach?.(this);
    });
  }

  private setIfDefined<T>(value: T | undefined, operation: (input: T) => void) {
    if (typeof value !== 'undefined') {
      operation.apply(this.mocha, [value]);
    }
  }

  public async dryRun({ coverageAnalysis, disableBail }: DryRunOptions): Promise<DryRunResult> {
    if (coverageAnalysis === 'perTest') {
      this.beforeEach = (context) => {
        this.instrumenterContext.currentTestId = context.currentTest?.fullTitle();
      };
    }
    const runResult = await this.run(disableBail);
    if (runResult.status === DryRunStatus.Complete && coverageAnalysis !== 'off') {
      runResult.mutantCoverage = this.instrumenterContext.mutantCoverage;
    }
    delete this.beforeEach;
    return runResult;
  }

  public async mutantRun({ activeMutant, testFilter, disableBail, hitLimit }: MutantRunOptions): Promise<MutantRunResult> {
    this.instrumenterContext.activeMutant = activeMutant.id;
    this.instrumenterContext.hitLimit = hitLimit;
    this.instrumenterContext.hitCount = hitLimit ? 0 : undefined;
    if (testFilter) {
      const metaRegExp = testFilter.map((testId) => `(${escapeRegExp(testId)})`).join('|');
      const regex = new RegExp(metaRegExp);
      this.mocha.grep(regex);
    } else {
      this.setIfDefined(this.originalGrep, this.mocha.grep);
    }
    const dryRunResult = await this.run(disableBail);
    return toMutantRunResult(dryRunResult, true);
  }

  public async run(disableBail: boolean): Promise<DryRunResult> {
    setBail(!disableBail, this.mocha.suite);
    try {
      await this.runMocha();
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

    function setBail(bail: boolean, suite: Suite) {
      suite.bail(bail);
      suite.suites.forEach((childSuite) => setBail(bail, childSuite));
    }
  }

  public async dispose(): Promise<void> {
    try {
      this.mocha?.dispose();
    } catch (err: any) {
      if (err?.code !== 'ERR_MOCHA_INSTANCE_ALREADY_RUNNING') {
        // Oops, didn't mean to catch this one
        throw err;
      }
    }
  }

  private runMocha(): Promise<void> {
    return new Promise<void>((res) => {
      this.mocha.run(() => res());
    });
  }
}
