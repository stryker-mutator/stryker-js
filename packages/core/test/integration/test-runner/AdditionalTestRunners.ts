import { isRegExp } from 'util';

import { StrykerOptions } from '@stryker-mutator/api/core';
import { commonTokens, declareClassPlugin, PluginKind, tokens } from '@stryker-mutator/api/plugin';
import { TestRunner2, DryRunResult, DryRunStatus, MutantRunResult } from '@stryker-mutator/api/test_runner2';
import { factory } from '@stryker-mutator/test-helpers';

class CoverageReportingTestRunner implements TestRunner2 {
  public async dryRun(): Promise<DryRunResult> {
    (global as any).__mutantCoverage__ = 'overridden';
    return { status: DryRunStatus.Complete, tests: [], mutantCoverage: factory.mutantCoverage({ static: { 1: 42 } }) };
  }
  public async mutantRun(): Promise<MutantRunResult> {
    throw new Error('Method not implemented.');
  }
}

class TimeBombTestRunner implements TestRunner2 {
  constructor() {
    // Setting a time bomb after 100 ms
    setTimeout(() => process.exit(), 500);
  }
  public async dryRun(): Promise<DryRunResult> {
    return factory.completeDryRunResult();
  }
  public async mutantRun(): Promise<MutantRunResult> {
    throw new Error('Method not implemented.');
  }
}

class ProximityMineTestRunner implements TestRunner2 {
  public async dryRun(): Promise<DryRunResult> {
    process.exit(42);
  }
  public async mutantRun(): Promise<MutantRunResult> {
    throw new Error('Method not implemented.');
  }
}

class DirectResolvedTestRunner implements TestRunner2 {
  public async dryRun(): Promise<DryRunResult> {
    (global as any).__mutantCoverage__ = 'coverageObject';
    return factory.completeDryRunResult();
  }
  public async mutantRun(): Promise<MutantRunResult> {
    throw new Error('Method not implemented.');
  }
}

class DiscoverRegexTestRunner implements TestRunner2 {
  public static inject = tokens(commonTokens.options);
  constructor(private readonly options: StrykerOptions) {}

  public async dryRun(): Promise<DryRunResult> {
    if (isRegExp(this.options.someRegex)) {
      return factory.completeDryRunResult();
    } else {
      return factory.errorDryRunResult({ errorMessage: 'No regex found in runnerOptions.strykerOptions.someRegex' });
    }
  }
  public async mutantRun(): Promise<MutantRunResult> {
    throw new Error('Method not implemented.');
  }
}

class ErroredTestRunner implements TestRunner2 {
  public async dryRun(): Promise<DryRunResult> {
    let expectedError: any = null;
    try {
      throw new SyntaxError('This is invalid syntax!');
    } catch (error) {
      expectedError = error;
    }
    return factory.errorDryRunResult({ errorMessage: expectedError });
  }
  public async mutantRun(): Promise<MutantRunResult> {
    throw new Error('Method not implemented.');
  }
}

class RejectInitRunner implements TestRunner2 {
  public init() {
    return Promise.reject(new Error('Init was rejected'));
  }

  public async dryRun(): Promise<DryRunResult> {
    throw new Error();
  }
  public async mutantRun(): Promise<MutantRunResult> {
    throw new Error('Method not implemented.');
  }
}

class NeverResolvedTestRunner implements TestRunner2 {
  public dryRun(): Promise<DryRunResult> {
    return new Promise<DryRunResult>(() => {});
  }
  public async mutantRun(): Promise<MutantRunResult> {
    throw new Error('Method not implemented.');
  }
}

class SlowInitAndDisposeTestRunner implements TestRunner2 {
  public inInit: boolean;

  public init() {
    return new Promise<void>((resolve) => {
      this.inInit = true;
      setTimeout(() => {
        this.inInit = false;
        resolve();
      }, 1000);
    });
  }

  public async dryRun() {
    if (this.inInit) {
      throw new Error('Test should fail! Not yet initialized!');
    }
    return factory.completeDryRunResult();
  }

  public async mutantRun(): Promise<MutantRunResult> {
    throw new Error('Method not implemented.');
  }

  public dispose() {
    return this.init();
  }
}
class VerifyWorkingFolderTestRunner implements TestRunner2 {
  public async dryRun(): Promise<DryRunResult> {
    if (process.cwd().toLowerCase() === __dirname.toLowerCase()) {
      return factory.completeDryRunResult();
    } else {
      throw new Error(`Expected ${process.cwd()} to be ${__dirname}`);
    }
  }
  public async mutantRun(): Promise<MutantRunResult> {
    throw new Error('Method not implemented.');
  }
}

class AsyncronousPromiseRejectionHandlerTestRunner implements TestRunner2 {
  public promise: Promise<void>;

  public init() {
    this.promise = Promise.reject('Reject for now, but will be caught asynchronously');
  }
  public async dryRun(): Promise<DryRunResult> {
    this.promise.catch(() => {});
    return factory.completeDryRunResult();
  }
  public async mutantRun(): Promise<MutantRunResult> {
    throw new Error('Method not implemented.');
  }
}

export const strykerPlugins = [
  declareClassPlugin(PluginKind.TestRunner2, 'verify-working-folder', VerifyWorkingFolderTestRunner),
  declareClassPlugin(PluginKind.TestRunner2, 'slow-init-dispose', SlowInitAndDisposeTestRunner),
  declareClassPlugin(PluginKind.TestRunner2, 'never-resolved', NeverResolvedTestRunner),
  declareClassPlugin(PluginKind.TestRunner2, 'errored', ErroredTestRunner),
  declareClassPlugin(PluginKind.TestRunner2, 'discover-regex', DiscoverRegexTestRunner),
  declareClassPlugin(PluginKind.TestRunner2, 'direct-resolved', DirectResolvedTestRunner),
  declareClassPlugin(PluginKind.TestRunner2, 'coverage-reporting', CoverageReportingTestRunner),
  declareClassPlugin(PluginKind.TestRunner2, 'time-bomb', TimeBombTestRunner),
  declareClassPlugin(PluginKind.TestRunner2, 'proximity-mine', ProximityMineTestRunner),
  declareClassPlugin(PluginKind.TestRunner2, 'async-promise-rejection-handler', AsyncronousPromiseRejectionHandlerTestRunner),
  declareClassPlugin(PluginKind.TestRunner2, 'reject-init', RejectInitRunner),
];
