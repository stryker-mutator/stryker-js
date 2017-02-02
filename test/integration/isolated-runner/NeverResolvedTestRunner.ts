import { EventEmitter } from 'events';
import { TestRunnerFactory, TestRunner, RunOptions, RunResult } from 'stryker-api/test_runner';

class NeverResolvedTestRunner extends EventEmitter implements TestRunner {

  run(options: RunOptions) {
    return new Promise<RunResult>(res => { });
  }
}

TestRunnerFactory.instance().register('never-resolved', NeverResolvedTestRunner);