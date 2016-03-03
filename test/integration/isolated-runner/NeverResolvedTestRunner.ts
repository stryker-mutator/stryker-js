import {TestRunnerFactory, TestRunner, RunOptions, RunResult, TestResult} from '../../../src/api/test_runner';

class NeverResolvedTestRunner extends TestRunner {
  
  run(options: RunOptions){
    return new Promise<RunResult>(res => {});
  }
}

TestRunnerFactory.instance().register('never-resolved', NeverResolvedTestRunner);