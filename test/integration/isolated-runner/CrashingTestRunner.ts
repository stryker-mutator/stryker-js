import { EventEmitter } from 'events'; 
import { RunResult, RunStatus, RunOptions, TestRunner, TestRunnerFactory } from 'stryker-api/test_runner';

class CrashingTestRunner extends EventEmitter implements TestRunner {

  run(options: RunOptions) {
    process.exit();
    return Promise.resolve({ status: RunStatus.Complete, tests: [] });
  }
}

TestRunnerFactory.instance().register('crash', CrashingTestRunner);