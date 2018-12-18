import { EOL } from 'os';
import { TestRunner, RunResult, TestResult, RunStatus, RunnerOptions } from 'stryker-api/test_runner';
import { Jasmine, toStrykerTestResult, evalGlobal } from './helpers';

export default class JasmineTestRunner implements TestRunner {

  private readonly jasmineConfigFile: string | undefined;
  private readonly fileNames: ReadonlyArray<string>;
  private readonly Date: typeof Date = Date; // take Date prototype now we still can (user might choose to mock it away)

  constructor(runnerOptions: RunnerOptions) {
    this.jasmineConfigFile = runnerOptions.strykerOptions.jasmineConfigFile;
    this.fileNames = runnerOptions.fileNames;
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
      errorMessages: ['An error occurred while loading your jasmine specs' + EOL + (error.stack || error.message || error.toString())],
      status: RunStatus.Error,
      tests: []
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

  public clearRequireCache() {
    this.fileNames.forEach(fileName => {
      delete require.cache[fileName];
    });
  }
}
