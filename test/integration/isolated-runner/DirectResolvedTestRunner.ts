import { EventEmitter } from 'events'; 
import { RunResult, RunStatus, RunOptions, TestRunner, TestRunnerFactory } from 'stryker-api/test_runner';

class DirectResolvedTestRunner extends EventEmitter implements TestRunner {

  runResult: RunResult = { status: RunStatus.Complete, tests: [] };

  run(options: RunOptions) {
    (Function('return this'))().__coverage__ = 'coverageObject';
    return Promise.resolve(this.runResult);
  }
}

TestRunnerFactory.instance().register('direct-resolved', DirectResolvedTestRunner);