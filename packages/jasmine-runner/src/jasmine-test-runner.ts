import { EOL } from 'os';

import { StrykerOptions, CoverageAnalysis, InstrumenterContext, MutantCoverage, INSTRUMENTER_CONSTANTS } from '@stryker-mutator/api/core';
import { commonTokens, tokens, Injector, PluginContext } from '@stryker-mutator/api/plugin';
import {
  DryRunStatus,
  TestResult,
  TestRunner,
  MutantRunOptions,
  DryRunResult,
  MutantRunResult,
  toMutantRunResult,
  ErrorDryRunResult,
  DryRunOptions,
  determineHitLimitReached,
  TestRunnerCapabilities,
} from '@stryker-mutator/api/test-runner';
import { errorToString, Task, DirectoryRequireCache, I } from '@stryker-mutator/util';

import { JasmineRunnerOptions } from '../src-generated/jasmine-runner-options';

import { Jasmine, toStrykerTestResult } from './helpers';
import * as pluginTokens from './plugin-tokens';

export function createJasmineTestRunnerFactory(
  namespace: typeof INSTRUMENTER_CONSTANTS.NAMESPACE | '__stryker2__' = INSTRUMENTER_CONSTANTS.NAMESPACE
): {
  (injector: Injector<PluginContext>): JasmineTestRunner;
  inject: ['$injector'];
} {
  createJasmineTestRunner.inject = tokens(commonTokens.injector);
  function createJasmineTestRunner(injector: Injector<PluginContext>) {
    return injector
      .provideClass(pluginTokens.directoryRequireCache, DirectoryRequireCache)
      .provideValue(pluginTokens.globalNamespace, namespace)
      .injectClass(JasmineTestRunner);
  }
  return createJasmineTestRunner;
}

export const createJasmineTestRunner = createJasmineTestRunnerFactory();

export class JasmineTestRunner implements TestRunner {
  private readonly jasmineConfigFile: string | undefined;
  private readonly Date: typeof Date = Date; // take Date prototype now we still can (user might choose to mock it away)
  private readonly instrumenterContext: InstrumenterContext;

  public static inject = tokens(commonTokens.options, pluginTokens.directoryRequireCache, pluginTokens.globalNamespace);
  constructor(
    options: StrykerOptions,
    private readonly requireCache: I<DirectoryRequireCache>,
    globalNamespace: typeof INSTRUMENTER_CONSTANTS.NAMESPACE | '__stryker2__'
  ) {
    this.jasmineConfigFile = (options as JasmineRunnerOptions).jasmineConfigFile;
    this.instrumenterContext = global[globalNamespace] ?? (global[globalNamespace] = {});
  }

  public capabilities(): TestRunnerCapabilities {
    return { reloadEnvironment: true };
  }

  public dryRun(options: DryRunOptions): Promise<DryRunResult> {
    return this.run(undefined, options.coverageAnalysis, options.disableBail);
  }

  public async mutantRun(options: MutantRunOptions): Promise<MutantRunResult> {
    this.instrumenterContext.activeMutant = options.activeMutant.id;
    this.instrumenterContext.hitLimit = options.hitLimit;
    this.instrumenterContext.hitCount = options.hitLimit ? 0 : undefined;
    const runResult = await this.run(options.testFilter, undefined, options.disableBail);
    return toMutantRunResult(runResult, true);
  }

  public async dispose(): Promise<void> {
    this.requireCache.clear();
  }

  private async run(testFilter: string[] | undefined, coverageAnalysis: CoverageAnalysis | undefined, disableBail: boolean): Promise<DryRunResult> {
    this.requireCache.clear();
    try {
      const jasmine = this.createJasmineRunner(testFilter, disableBail);
      const self = this;
      const tests: TestResult[] = [];
      const runTask = new Task<DryRunResult>();
      let startTimeCurrentSpec = 0;
      const reporter: jasmine.CustomReporter = {
        specStarted(spec) {
          if (coverageAnalysis && coverageAnalysis === 'perTest') {
            self.instrumenterContext.currentTestId = spec.id;
          }
          startTimeCurrentSpec = new self.Date().getTime();
        },
        specDone(result: jasmine.CustomReporterResult) {
          tests.push(toStrykerTestResult(result, new self.Date().getTime() - startTimeCurrentSpec));
        },
        jasmineDone() {
          self.requireCache.record();
          let mutantCoverage: MutantCoverage | undefined = undefined;
          if (coverageAnalysis === 'all' || coverageAnalysis === 'perTest') {
            mutantCoverage = self.instrumenterContext.mutantCoverage;
          }
          const timeoutResult = determineHitLimitReached(self.instrumenterContext.hitCount, self.instrumenterContext.hitLimit);
          if (timeoutResult) {
            runTask.resolve(timeoutResult);
            return;
          }
          runTask.resolve({
            status: DryRunStatus.Complete,
            tests,
            mutantCoverage,
          });
        },
      };

      jasmine.env.addReporter(reporter);
      const maybePromise = jasmine.execute();
      if (maybePromise) {
        maybePromise.catch((err) => {
          runTask.reject(err);
        });
      }
      const result = await runTask.promise;
      return result;
    } catch (error) {
      const errorResult: ErrorDryRunResult = {
        errorMessage: `An error occurred while loading your jasmine specs${EOL}${errorToString(error)}`,
        status: DryRunStatus.Error,
      };
      return errorResult;
    }
  }

  private createJasmineRunner(testFilter: string[] | undefined, disableBail: boolean) {
    let specFilter: ((spec: jasmine.Spec) => boolean) | undefined = undefined;
    if (testFilter) {
      specFilter = (spec) => testFilter.includes(spec.id.toString());
    }
    const jasmine = new Jasmine({ projectBaseDir: process.cwd() });
    // The `loadConfigFile` will fallback on the default
    jasmine.loadConfigFile(this.jasmineConfigFile);
    jasmine.env.configure({
      failFast: !disableBail,
      oneFailurePerSpec: true,
      specFilter,
    });

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    jasmine.exit = () => {};
    jasmine.env.clearReporters();
    jasmine.randomizeTests(false);
    return jasmine;
  }
}
