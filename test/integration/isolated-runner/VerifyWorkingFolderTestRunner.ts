import { EventEmitter } from 'events';
import { RunResult, RunStatus, RunOptions, TestRunner, TestRunnerFactory } from 'stryker-api/test_runner';
class VerifyWorkingFolderTestRunner extends EventEmitter implements TestRunner {

  runResult: RunResult = { status: RunStatus.Complete, tests: [] };

  run(options: RunOptions) {
   if (process.cwd() === __dirname) {
      return Promise.resolve(this.runResult);
    } else {
      return Promise.reject(new Error(`Expected ${process.cwd()} to be ${__dirname}`));
    }
  }
}

TestRunnerFactory.instance().register('verify-working-folder', VerifyWorkingFolderTestRunner);