import { TestRunner, TestRunnerFactory, RunnerOptions, RunOptions } from 'stryker-api/test_runner';
import { errorToString } from '@stryker-mutator/util';
import { tokens, commonTokens, PluginResolver } from 'stryker-api/plugin';

export class ChildProcessTestRunnerWorker implements TestRunner {

  private readonly underlyingTestRunner: TestRunner;

  public static inject = tokens('realTestRunnerName', 'runnerOptions', commonTokens.pluginResolver);
  constructor(realTestRunnerName: string, options: RunnerOptions, _: PluginResolver) {
    this.underlyingTestRunner = TestRunnerFactory.instance().create(realTestRunnerName, options);
  }

  public async init(): Promise<void> {
    if (this.underlyingTestRunner.init) {
      await this.underlyingTestRunner.init();
    }
  }

  public async dispose() {
    if (this.underlyingTestRunner.dispose) {
      await this.underlyingTestRunner.dispose();
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
