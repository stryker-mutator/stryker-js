import { StrykerOptions } from '@stryker-mutator/api/core';
import { commonTokens, declareClassPlugin, PluginKind, tokens } from '@stryker-mutator/api/plugin';
import { RunResult, RunStatus, TestRunner } from '@stryker-mutator/api/test_runner';
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
  public static inject = tokens(commonTokens.options);
  constructor(private readonly options: StrykerOptions) {}

  public run(): Promise<RunResult> {
    if (isRegExp(this.options.someRegex)) {
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
    return new Promise<RunResult>(() => {});
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
    this.promise.catch(() => {});
    return Promise.resolve({ status: RunStatus.Complete, tests: [] });
  }
}

export const strykerPlugins = [
  declareClassPlugin(PluginKind.TestRunner, 'verify-working-folder', VerifyWorkingFolderTestRunner),
  declareClassPlugin(PluginKind.TestRunner, 'slow-init-dispose', SlowInitAndDisposeTestRunner),
  declareClassPlugin(PluginKind.TestRunner, 'never-resolved', NeverResolvedTestRunner),
  declareClassPlugin(PluginKind.TestRunner, 'errored', ErroredTestRunner),
  declareClassPlugin(PluginKind.TestRunner, 'discover-regex', DiscoverRegexTestRunner),
  declareClassPlugin(PluginKind.TestRunner, 'direct-resolved', DirectResolvedTestRunner),
  declareClassPlugin(PluginKind.TestRunner, 'coverage-reporting', CoverageReportingTestRunner),
  declareClassPlugin(PluginKind.TestRunner, 'time-bomb', TimeBombTestRunner),
  declareClassPlugin(PluginKind.TestRunner, 'proximity-mine', ProximityMineTestRunner),
  declareClassPlugin(PluginKind.TestRunner, 'async-promise-rejection-handler', AsyncronousPromiseRejectionHandlerTestRunner),
  declareClassPlugin(PluginKind.TestRunner, 'reject-init', RejectInitRunner)
];
