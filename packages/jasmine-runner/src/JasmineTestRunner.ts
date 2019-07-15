import { EOL } from 'os';
import { TestRunner, RunResult, TestResult, RunStatus } from '@stryker-mutator/api/test_runner';
import { JASMINE, toStrykerTestResult, evalGlobal } from './helpers';
import { tokens, COMMON_TOKENS } from '@stryker-mutator/api/plugin';
import { StrykerOptions } from '@stryker-mutator/api/core';
import { errorToString } from '@stryker-mutator/util';

export default class JasmineTestRunner implements TestRunner {

  private readonly jasmineConfigFile: string | undefined;
  private readonly date: typeof Date = Date; // take Date prototype now we still can (user might choose to mock it away)

  public static inject = tokens(COMMON_TOKENS.sandboxFileNames, COMMON_TOKENS.options);
  constructor(private readonly fileNames: ReadonlyArray<string>, options: StrykerOptions) {
    this.jasmineConfigFile = options.jasmineConfigFile;
  }

  public run(options: { testHooks?: string }): Promise<RunResult> {
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
          startTimeCurrentSpec = new self.date().getTime();
        },

        specDone(result: jasmine.CustomReporterResult) {
          tests.push(toStrykerTestResult(result, new self.date().getTime() - startTimeCurrentSpec));
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
      errorMessages: ['An error occurred while loading your jasmine specs' + EOL + errorToString(error)],
      status: RunStatus.Error,
      tests: []
    }));
  }

  private createJasmineRunner() {
    const jasmine = new JASMINE({ projectBaseDir: process.cwd() });
    // The `loadConfigFile` will fallback on the default
    jasmine.loadConfigFile(this.jasmineConfigFile);
    jasmine.stopSpecOnExpectationFailure(true);
    jasmine.env.throwOnExpectationFailure(true);
    jasmine.exit = () => { };
    jasmine.clearReporters();
    jasmine.randomizeTests(false);
    return jasmine;
  }

  public clearRequireCache() {
    this.fileNames.forEach(fileName => {
      delete require.cache[fileName];
    });
  }
}
