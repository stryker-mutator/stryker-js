import { EOL } from 'os';

import { StrykerOptions } from '@stryker-mutator/api/core';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { RunResult, RunStatus, TestResult, TestRunner2, MutantRunOptions, DryRunResult, MutantRunResult } from '@stryker-mutator/api/test_runner2';
import { errorToString, Task } from '@stryker-mutator/util';
import { TestSelection } from '@stryker-mutator/api/test_framework';

import { JasmineRunnerOptions } from '../src-generated/jasmine-runner-options';

import { Jasmine, toStrykerTestResult } from './helpers';

export default class JasmineTestRunner implements TestRunner2 {
  private readonly jasmineConfigFile: string | undefined;
  private readonly Date: typeof Date = Date; // take Date prototype now we still can (user might choose to mock it away)

  public static inject = tokens(commonTokens.sandboxFileNames, commonTokens.options);
  constructor(private readonly fileNames: readonly string[], options: StrykerOptions) {
    this.jasmineConfigFile = (options as JasmineRunnerOptions).jasmineConfigFile;
  }

  public dryRun(): Promise<DryRunResult> {
    return this.run();
  }

  public mutantRun(options: MutantRunOptions): Promise<MutantRunResult> {
    global.__activeMutant__ = options.activeMutant.id;
    return this.run(options.testFilter);
  }

  private async run(testFilter?: TestSelection[]) {
    this.clearRequireCache();
    try {
      const jasmine = this.createJasmineRunner(testFilter);
      const self = this;
      const tests: TestResult[] = [];
      const runTask = new Task<RunResult>();
      let startTimeCurrentSpec = 0;
      const reporter: jasmine.CustomReporter = {
        specStarted() {
          startTimeCurrentSpec = new self.Date().getTime();
        },
        specDone(result: jasmine.CustomReporterResult) {
          tests.push(toStrykerTestResult(result, new self.Date().getTime() - startTimeCurrentSpec));
        },
        jasmineDone() {
          runTask.resolve({
            status: RunStatus.Complete,
            tests,
          });
        },
      };

      jasmine.env.addReporter(reporter);
      jasmine.execute();
      const result = await runTask.promise;
      return result;
    } catch (error) {
      const errorResult: RunResult = {
        errorMessage: `An error occurred while loading your jasmine specs${EOL}${errorToString(error)}`,
        status: RunStatus.Error,
        tests: [],
      };
      return errorResult;
    }
  }

  private createJasmineRunner(testFilter: undefined | TestSelection[]) {
    let specFilter: undefined | Function = undefined;
    if (testFilter) {
      const specNames = testFilter.map((test) => test.name);
      specFilter = (spec: jasmine.Spec) => specNames.includes(spec.getFullName());
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
