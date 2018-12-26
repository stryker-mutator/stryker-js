import { RunnerOptions, RunOptions, TestRunner, TestRunnerFactory } from 'stryker-api/test_runner';
import { errorToString } from '../utils/objectUtils';

export default class ChildProcessTestRunnerWorker implements TestRunner {

  private readonly underlyingTestRunner: TestRunner;

  constructor(realTestRunnerName: string, options: RunnerOptions) {
    this.underlyingTestRunner = TestRunnerFactory.instance().create(realTestRunnerName, options);
  }

  public async dispose() {
    if (this.underlyingTestRunner.dispose) {
      await this.underlyingTestRunner.dispose();
    }
  }

  public async init(): Promise<void> {
    if (this.underlyingTestRunner.init) {
      await this.underlyingTestRunner.init();
    }
  }

  public async run(options: RunOptions) {
    const result = await this.underlyingTestRunner.run(options);
    // If the test runner didn't report on coverage, let's try to do it ourselves.
    if (!result.coverage) {
      result.coverage = (global as any).__coverage__;
    }
    if (result.errorMessages) {
      // errorMessages should be a string[]
      // Just in case the test runner implementer forgot to convert `Error`s to string, we will do it here
      // https://github.com/stryker-mutator/stryker/issues/141
      result.errorMessages = result.errorMessages.map(errorToString);
    }

    return result;
  }
}
