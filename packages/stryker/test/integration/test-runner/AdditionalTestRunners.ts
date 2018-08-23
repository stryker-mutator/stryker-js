import { RunResult, RunStatus, RunnerOptions, TestRunner, TestRunnerFactory } from 'stryker-api/test_runner';
import { isRegExp } from 'util';

class CoverageReportingTestRunner implements TestRunner {
  public run() {
    (global as any).__coverage__ = 'overridden';
    return Promise.resolve({ status: RunStatus.Complete, tests: [], coverage: 'realCoverage' as any });
  }
}

class TimeBombTestRunner implements TestRunner {
  constructor() {
    // Setting a time bomb after 100 ms
    setTimeout(() => process.exit(), 500);
  }
  public run() {
    return Promise.resolve({ status: RunStatus.Complete, tests: [] });
  }
}

class ProximityMineTestRunner implements TestRunner {
  public run() {
    process.exit(42);
    return Promise.resolve({ status: RunStatus.Complete, tests: [] });
  }
}

class DirectResolvedTestRunner implements TestRunner {
  public run() {
    (global as any).__coverage__ = 'coverageObject';
    return Promise.resolve({ status: RunStatus.Complete, tests: [] });
  }
}

class DiscoverRegexTestRunner implements TestRunner {

  constructor(private readonly runnerOptions: RunnerOptions) {
  }

  public run(): Promise<RunResult> {
    if (isRegExp(this.runnerOptions.strykerOptions.someRegex)) {
      return Promise.resolve({ status: RunStatus.Complete, tests: [] });
    } else {
      return Promise.resolve({ status: RunStatus.Error, tests: [], errorMessages: ['No regex found in runnerOptions.strykerOptions.someRegex'] });
    }
  }
}

class ErroredTestRunner implements TestRunner {

  public run() {
    let expectedError: any = null;
    try {
      throw new SyntaxError('This is invalid syntax!');
    } catch (error) {
      expectedError = error;
    }
    return Promise.resolve({ status: RunStatus.Error, errorMessages: [expectedError], tests: [] });
  }
}

class RejectInitRunner implements TestRunner {

  public init() {
    return Promise.reject(new Error('Init was rejected'));
  }

  public run(): Promise<RunResult> {
    throw new Error();
  }
}

class NeverResolvedTestRunner implements TestRunner {
  public run() {
    return new Promise<RunResult>(() => { });
  }
}

class SlowInitAndDisposeTestRunner implements TestRunner {

  public inInit: boolean;

  public init() {
    return new Promise<void>(resolve => {
      this.inInit = true;
      setTimeout(() => {
        this.inInit = false;
        resolve();
      }, 1000);
    });
  }

  public run() {
    if (this.inInit) {
      throw new Error('Test should fail! Not yet initialized!');
    }
    return Promise.resolve({ status: RunStatus.Complete, tests: [] });
  }

  public dispose() {
    return this.init();
  }
}
class VerifyWorkingFolderTestRunner implements TestRunner {

  public runResult: RunResult = { status: RunStatus.Complete, tests: [] };

  public run() {
    if (process.cwd().toLowerCase() === __dirname.toLowerCase()) {
      return Promise.resolve(this.runResult);
    } else {
      return Promise.reject(new Error(`Expected ${process.cwd()} to be ${__dirname}`));
    }
  }
}

class AsyncronousPromiseRejectionHandlerTestRunner implements TestRunner {
  public promise: Promise<void>;

  public init() {
    this.promise = Promise.reject('Reject for now, but will be caught asynchronously');
  }

  public run() {
    this.promise.catch(() => { });
    return Promise.resolve({ status: RunStatus.Complete, tests: [] });
  }
}

TestRunnerFactory.instance().register('verify-working-folder', VerifyWorkingFolderTestRunner);
TestRunnerFactory.instance().register('slow-init-dispose', SlowInitAndDisposeTestRunner);
TestRunnerFactory.instance().register('never-resolved', NeverResolvedTestRunner);
TestRunnerFactory.instance().register('errored', ErroredTestRunner);
TestRunnerFactory.instance().register('discover-regex', DiscoverRegexTestRunner);
TestRunnerFactory.instance().register('direct-resolved', DirectResolvedTestRunner);
TestRunnerFactory.instance().register('coverage-reporting', CoverageReportingTestRunner);
TestRunnerFactory.instance().register('time-bomb', TimeBombTestRunner);
TestRunnerFactory.instance().register('proximity-mine', ProximityMineTestRunner);
TestRunnerFactory.instance().register('async-promise-rejection-handler', AsyncronousPromiseRejectionHandlerTestRunner);
TestRunnerFactory.instance().register('reject-init', RejectInitRunner);
