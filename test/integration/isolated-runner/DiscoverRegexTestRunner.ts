import { TestRunnerFactory, RunnerOptions, TestRunner, RunOptions, RunResult, TestResult } from 'stryker-api/test_runner';
import { isRegExp } from 'util';

class DiscoverRegexTestRunner implements TestRunner {

  constructor(private runnerOptions: RunnerOptions) {
  }

  run(options: RunOptions) {
    if (isRegExp(this.runnerOptions.strykerOptions['someRegex'])) {
      return Promise.resolve({ result: TestResult.Complete, testNames: []});
    } else {
      return Promise.resolve({ result: TestResult.Error, testNames: [], errorMessages: ['No regex found in runnerOptions.strykerOptions.someRegex'] });
    }
  }
}

TestRunnerFactory.instance().register('discover-regex', DiscoverRegexTestRunner);