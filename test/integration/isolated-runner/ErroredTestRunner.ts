import { EventEmitter } from 'events';
import { RunResult, RunStatus, RunOptions, TestRunner, TestRunnerFactory } from 'stryker-api/test_runner';

class ErroredTestRunner extends EventEmitter implements TestRunner {

  run(options: RunOptions) {
    let expectedError: any = null;
    try {
      throw new SyntaxError('This is invalid syntax!');
    } catch (error) {
      expectedError = error;
    }
    return Promise.resolve({ status: RunStatus.Error, errorMessages: [expectedError], tests: [] });
  }
}

TestRunnerFactory.instance().register('errored', ErroredTestRunner);