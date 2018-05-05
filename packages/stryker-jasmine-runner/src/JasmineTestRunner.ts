import { EOL } from 'os';
import { TestRunner, RunResult, TestResult, RunStatus } from 'stryker-api/test_runner';
import { StrykerOptions } from 'stryker-api/core';
import { Jasmine, toStrykerTestResult, evalGlobal } from './helpers';

export default class JasmineTestRunner implements TestRunner {

  private jasmineConfigFile: string | undefined;
  private fileNames: ReadonlyArray<string>;
  private Date: { new(): Date } = Date; // take Date prototype now we still can (user might choose to mock it away)

  constructor({ fileNames, strykerOptions: { jasmineConfigFile } }: { fileNames: ReadonlyArray<string>, strykerOptions: StrykerOptions }) {
    this.jasmineConfigFile = jasmineConfigFile;
    this.fileNames = fileNames;
  }

  run(options: { testHooks?: string }): Promise<RunResult> {
    this.clearRequireCache();
    const tests: TestResult[] = [];
    let startTimeCurrentSpec = 0;
    const jasmine = this.createJasmineRunner();
    const self = this;
    if (options.testHooks) {
      evalGlobal(options.testHooks);
    }
    return new Promise<RunResult>(resolve => {
      const reporter: jasmine.CustomReporter = {
        specStarted() {
          startTimeCurrentSpec = new self.Date().getTime();
        },

        specDone(result: jasmine.CustomReporterResult) {
          tests.push(toStrykerTestResult(result, new self.Date().getTime() - startTimeCurrentSpec));
        },

        jasmineDone() {
          resolve({
            errorMessages: [],
            status: RunStatus.Complete,
            tests
          });
        }
      };
      jasmine.addReporter(reporter);
      jasmine.execute();
    }).catch(error => ({
      tests: [],
      status: RunStatus.Error,
      errorMessages: ['An error occurred while loading your jasmine specs' + EOL + (error.stack || error.message || error.toString())]
    }));
  }

  private createJasmineRunner() {
    const jasmine = new Jasmine({ projectBaseDir: process.cwd() });
    // The `loadConfigFile` will fallback on the default
    jasmine.loadConfigFile(this.jasmineConfigFile);
    jasmine.stopSpecOnExpectationFailure(true);
    jasmine.env.throwOnExpectationFailure(true);
    jasmine.exit = () => { };
    jasmine.clearReporters();
    jasmine.randomizeTests(false);
    return jasmine;
  }

  clearRequireCache() {
    this.fileNames.forEach(fileName => {
      delete require.cache[fileName];
    });
  }
}