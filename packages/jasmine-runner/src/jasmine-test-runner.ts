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
import { errorToString } from '@stryker-mutator/util';
import jasmine from 'jasmine';

import { JasmineRunnerOptions } from '../src-generated/jasmine-runner-options';

import { createJasmine, toStrykerTestResult } from './helpers';
import * as pluginTokens from './plugin-tokens';

export function createJasmineTestRunnerFactory(
  namespace: typeof INSTRUMENTER_CONSTANTS.NAMESPACE | '__stryker2__' = INSTRUMENTER_CONSTANTS.NAMESPACE
): {
  (injector: Injector<PluginContext>): JasmineTestRunner;
  inject: ['$injector'];
} {
  createJasmineTestRunner.inject = tokens(commonTokens.injector);
  function createJasmineTestRunner(injector: Injector<PluginContext>) {
    return injector.provideValue(pluginTokens.globalNamespace, namespace).injectClass(JasmineTestRunner);
  }
  return createJasmineTestRunner;
}

export const createJasmineTestRunner = createJasmineTestRunnerFactory();

export class JasmineTestRunner implements TestRunner {
  private readonly jasmineConfigFile: string | undefined;
  private readonly Date: typeof Date = Date; // take Date prototype now we still can (user might choose to mock it away)
  private readonly instrumenterContext: InstrumenterContext;

  public static inject = tokens(commonTokens.options, pluginTokens.globalNamespace);
  constructor(options: StrykerOptions, globalNamespace: typeof INSTRUMENTER_CONSTANTS.NAMESPACE | '__stryker2__') {
    this.jasmineConfigFile = (options as JasmineRunnerOptions).jasmineConfigFile;
    this.instrumenterContext = global[globalNamespace] ?? (global[globalNamespace] = {});
  }

  public capabilities(): TestRunnerCapabilities {
    // Jasmine uses `import` to load the files. We can't unload them after.
    return { reloadEnvironment: false };
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

  private async run(testFilter: string[] | undefined, coverageAnalysis: CoverageAnalysis | undefined, disableBail: boolean): Promise<DryRunResult> {
    try {
      if (!this.jasmine) {
        this.jasmine = await this.createAndConfigureJasmineRunner(disableBail);
      }
      const jasmineInstance: jasmine = this.jasmine;
      this.specIdsFilter = testFilter;
      const self = this;
      const tests: TestResult[] = [];
      let startTimeCurrentSpec = 0;
      let result: DryRunResult | undefined;
      const reporter: jasmine.CustomReporter = {
        specStarted(spec) {
          if (coverageAnalysis && coverageAnalysis === 'perTest') {
            self.instrumenterContext.currentTestId = spec.id;
          }
          startTimeCurrentSpec = new self.Date().getTime();
        },
        specDone(specResult: jasmine.SpecResult) {
          tests.push(toStrykerTestResult(specResult, new self.Date().getTime() - startTimeCurrentSpec));
        },
        jasmineDone() {
          let mutantCoverage: MutantCoverage | undefined = undefined;
          if (coverageAnalysis === 'all' || coverageAnalysis === 'perTest') {
            mutantCoverage = self.instrumenterContext.mutantCoverage;
          }
          result = determineHitLimitReached(self.instrumenterContext.hitCount, self.instrumenterContext.hitLimit) ?? {
            status: DryRunStatus.Complete,
            tests,
            mutantCoverage,
          };
        },
      };
      jasmineInstance.env.clearReporters();
      jasmineInstance.env.addReporter(reporter);
      await jasmineInstance.execute();
      if (!result) {
        throw new Error('Jasmine reporter didn\'t report "jasmineDone", this shouldn\'t happen');
      }
      return result;
    } catch (error) {
      const errorResult: ErrorDryRunResult = {
        errorMessage: `An error occurred${EOL}${errorToString(error)}`,
        status: DryRunStatus.Error,
      };
      return errorResult;
    }
  }

  private jasmine?: jasmine;
  private specIdsFilter?: string[];

  private async createAndConfigureJasmineRunner(disableBail: boolean): Promise<jasmine> {
    const specFilter = (spec: jasmine.Spec): boolean => {
      return this.specIdsFilter?.includes(spec.id.toString()) ?? true;
    };
    const jasmineInstance = createJasmine({ projectBaseDir: process.cwd() });
    // The `loadConfigFile` will fallback on the default
    await jasmineInstance.loadConfigFile(this.jasmineConfigFile);
    jasmineInstance.env.configure({
      // from jasmine 4
      stopOnSpecFailure: !disableBail,
      stopSpecOnExpectationFailure: true,

      // jasmine 3
      failFast: !disableBail,
      oneFailurePerSpec: true,

      // Always
      random: false,
      autoCleanClosures: false,
      specFilter,
    });
    jasmineInstance.exitOnCompletion = false;
    return jasmineInstance;
  }
}
