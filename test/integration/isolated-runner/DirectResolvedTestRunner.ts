import {TestRunnerFactory, TestRunner, RunOptions, RunResult, TestResult} from '../../../src/api/test_runner';

class DirectResolvedTestRunner extends TestRunner {
  
  runResult: RunResult = { result: TestResult.Complete, specNames: []};
  
  run(options: RunOptions){
    return Promise.resolve(this.runResult);
  }
}

TestRunnerFactory.instance().register('direct-resolved', DirectResolvedTestRunner);