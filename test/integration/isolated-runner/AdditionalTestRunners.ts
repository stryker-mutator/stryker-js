import { EventEmitter } from 'events'; 
import { RunResult, RunStatus, RunOptions, RunnerOptions, TestRunner, TestRunnerFactory } from 'stryker-api/test_runner';
import { isRegExp } from 'util';

class CoverageReportingTestRunner extends EventEmitter implements TestRunner {
  run(options: RunOptions) {
    (global as any).__coverage__ = 'overridden';
    return Promise.resolve({ status: RunStatus.Complete, tests: [], coverage: <any>'realCoverage' });
  }
}

class CrashingTestRunner extends EventEmitter implements TestRunner {
  run(options: RunOptions) {
    process.exit();
    return Promise.resolve({ status: RunStatus.Complete, tests: [] });
  }
}

class DirectResolvedTestRunner extends EventEmitter implements TestRunner {
  run(options: RunOptions) {
    (global as any).__coverage__ = 'coverageObject';
    return Promise.resolve({ status: RunStatus.Complete, tests: [] });
  }
}

class DiscoverRegexTestRunner extends EventEmitter implements TestRunner {

  constructor(private runnerOptions: RunnerOptions) {
    super();
  }

  run(options: RunOptions): Promise<RunResult> {
    if (isRegExp(this.runnerOptions.strykerOptions['someRegex'])) {
      return Promise.resolve({ status: RunStatus.Complete, tests: []});
    } else {
      return Promise.resolve({ status: RunStatus.Error, tests: [], errorMessages: ['No regex found in runnerOptions.strykerOptions.someRegex'] });
    }
  }
}


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

class NeverResolvedTestRunner extends EventEmitter implements TestRunner {
  run(options: RunOptions) {
    return new Promise<RunResult>(res => { });
  }
}

class SlowInitAndDisposeTestRunner extends EventEmitter implements TestRunner {

  inInit: boolean;

  init() {
    return new Promise(resolve => {
      this.inInit = true;
      setTimeout(() => {
        this.inInit = false;
        resolve();
      }, 1000);
    });
  }

  run(options: RunOptions) {
    if (this.inInit) {
      throw new Error('Test should fail! Not yet initialized!');
    }
    return Promise.resolve({ status: RunStatus.Complete, tests: [] });
  }

  dispose() {
    return this.init();
  }
}
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
TestRunnerFactory.instance().register('slow-init-dispose', SlowInitAndDisposeTestRunner);
TestRunnerFactory.instance().register('never-resolved', NeverResolvedTestRunner);
TestRunnerFactory.instance().register('errored', ErroredTestRunner);
TestRunnerFactory.instance().register('discover-regex', DiscoverRegexTestRunner);
TestRunnerFactory.instance().register('direct-resolved', DirectResolvedTestRunner);
TestRunnerFactory.instance().register('coverage-reporting', CoverageReportingTestRunner);
TestRunnerFactory.instance().register('crash', CrashingTestRunner);