import { EOL } from 'os';

import { StrykerOptions, CoverageAnalysis } from '@stryker-mutator/api/core';
import { commonTokens, tokens, Injector, PluginContext } from '@stryker-mutator/api/plugin';
import {
  DryRunStatus,
  TestResult,
  TestRunner2,
  MutantRunOptions,
  DryRunResult,
  MutantRunResult,
  toMutantRunResult,
  ErrorDryRunResult,
  DryRunOptions,
  MutantCoverage,
} from '@stryker-mutator/api/test_runner';
import { errorToString, Task, DirectoryRequireCache, I } from '@stryker-mutator/util';

import { JasmineRunnerOptions } from '../src-generated/jasmine-runner-options';

import { Jasmine, toStrykerTestResult } from './helpers';
import * as pluginTokens from './pluginTokens';

createJasmineTestRunner.inject = tokens(commonTokens.injector);
export function createJasmineTestRunner(injector: Injector<PluginContext>) {
  return injector.provideClass(pluginTokens.directoryRequireCache, DirectoryRequireCache).injectClass(JasmineTestRunner);
}

export class JasmineTestRunner implements TestRunner2 {
  private readonly jasmineConfigFile: string | undefined;
  private readonly Date: typeof Date = Date; // take Date prototype now we still can (user might choose to mock it away)

  public static inject = tokens(commonTokens.options, pluginTokens.directoryRequireCache);
  constructor(options: StrykerOptions, private readonly requireCache: I<DirectoryRequireCache>) {
    this.jasmineConfigFile = (options as JasmineRunnerOptions).jasmineConfigFile;
  }

  public dryRun(options: DryRunOptions): Promise<DryRunResult> {
    return this.run(undefined, options.coverageAnalysis);
  }

  public async mutantRun(options: MutantRunOptions): Promise<MutantRunResult> {
    global.__activeMutant__ = options.activeMutant.id;
    const runResult = await this.run(options.testFilter);
    return toMutantRunResult(runResult);
  }

  public async init(): Promise<void> {
    this.requireCache.init({ rootModuleId: require.resolve('jasmine'), initFiles: [] });
  }

  public async dispose(): Promise<void> {
    this.requireCache.clear();
  }

  private async run(testFilter?: string[], coverageAnalysis?: CoverageAnalysis): Promise<DryRunResult> {
    this.requireCache.clear();
    try {
      const jasmine = this.createJasmineRunner(testFilter);
      const self = this;
      const tests: TestResult[] = [];
      const runTask = new Task<DryRunResult>();
      let startTimeCurrentSpec = 0;
      const reporter: jasmine.CustomReporter = {
        specStarted(spec) {
          if (coverageAnalysis && coverageAnalysis === 'perTest') {
            global.__currentTestId__ = spec.id;
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
            mutantCoverage = global.__mutantCoverage__;
          }
          runTask.resolve({
            status: DryRunStatus.Complete,
            tests,
            mutantCoverage,
          });
        },
      };

      jasmine.env.addReporter(reporter);
      jasmine.execute();
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

  private createJasmineRunner(testFilter: undefined | string[]) {
    let specFilter: undefined | ((spec: jasmine.Spec) => boolean) = undefined;
    if (testFilter) {
      specFilter = (spec) => testFilter.includes(spec.id.toString());
    }
    const jasmine = new Jasmine({ projectBaseDir: process.cwd() });
    // The `loadConfigFile` will fallback on the default
    jasmine.loadConfigFile(this.jasmineConfigFile);
    jasmine.env.configure({
      failFast: true,
      oneFailurePerSpec: true,
      specFilter,
    });

    jasmine.exit = () => {};
    jasmine.env.clearReporters();
    jasmine.randomizeTests(false);
    return jasmine;
  }
}
