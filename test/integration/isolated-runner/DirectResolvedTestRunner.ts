import {TestRunnerFactory, TestRunner, RunOptions, RunResult, TestResult} from 'stryker-api/test_runner';

class DirectResolvedTestRunner implements TestRunner {
  
  runResult: RunResult = { result: TestResult.Complete, testNames: []};
  
  run(options: RunOptions){
    return Promise.resolve(this.runResult);
  }
}

TestRunnerFactory.instance().register('direct-resolved', DirectResolvedTestRunner);