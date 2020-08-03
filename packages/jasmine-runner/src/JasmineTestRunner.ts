import { EOL } from 'os';

import { StrykerOptions, CoverageAnalysis } from '@stryker-mutator/api/core';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
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
} from '@stryker-mutator/api/test_runner2';
import { errorToString, Task } from '@stryker-mutator/util';

import { JasmineRunnerOptions } from '../src-generated/jasmine-runner-options';

import { Jasmine, toStrykerTestResult } from './helpers';

export default class JasmineTestRunner implements TestRunner2 {
  private readonly jasmineConfigFile: string | undefined;
  private readonly Date: typeof Date = Date; // take Date prototype now we still can (user might choose to mock it away)

  public static inject = tokens(commonTokens.sandboxFileNames, commonTokens.options);
  constructor(private readonly fileNames: readonly string[], options: StrykerOptions) {
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

  private async run(testFilter?: string[], coverageAnalysis?: CoverageAnalysis): Promise<DryRunResult> {
    this.clearRequireCache();
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
      specFilter = (spec: jasmine.Spec) => testFilter.includes(spec.id.toString());
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

  private clearRequireCache() {
    this.fileNames.forEach((fileName) => {
      delete require.cache[fileName];
    });
  }
}
