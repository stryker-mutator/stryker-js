import { TestRunnerFactory, TestRunner, RunOptions, RunResult, TestResult } from 'stryker-api/test_runner';

class NeverResolvedTestRunner implements TestRunner {

  run(options: RunOptions) {
    return new Promise<RunResult>(res => { });
  }
}

TestRunnerFactory.instance().register('never-resolved', NeverResolvedTestRunner);