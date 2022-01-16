import os from 'os';
import { types } from 'util';
import fs from 'fs';

import { StrykerOptions } from '@stryker-mutator/api/core';
import { commonTokens, declareClassPlugin, PluginKind, tokens } from '@stryker-mutator/api/plugin';
import {
  TestRunner,
  DryRunResult,
  DryRunStatus,
  MutantRunResult,
  DryRunOptions,
  MutantRunOptions,
  TestRunnerCapabilities,
} from '@stryker-mutator/api/test-runner';
import { factory } from '@stryker-mutator/test-helpers';

abstract class NotImplementedTestRunner implements TestRunner {
  public capabilities(): Promise<TestRunnerCapabilities> {
    return Promise.resolve({ reloadEnvironment: true });
  }
  public dryRun(_options: DryRunOptions): Promise<DryRunResult> {
    throw new Error('Method not implemented.');
  }
  public mutantRun(_options: MutantRunOptions): Promise<MutantRunResult> {
    throw new Error('Method not implemented.');
  }
}

class CoverageReportingTestRunner extends NotImplementedTestRunner {
  public async dryRun(): Promise<DryRunResult> {
    (global as any).__mutantCoverage__ = 'overridden';
    return { status: DryRunStatus.Complete, tests: [], mutantCoverage: factory.mutantCoverage({ static: { 1: 42 } }) };
  }
}

class TimeBombTestRunner extends NotImplementedTestRunner {
  constructor() {
    super();
    // Setting a time bomb after 100 ms
    setTimeout(() => process.exit(), 500);
  }
  public async dryRun(): Promise<DryRunResult> {
    return factory.completeDryRunResult();
  }
}

class ProximityMineTestRunner extends NotImplementedTestRunner {
  public async dryRun(): Promise<DryRunResult> {
    process.exit(42);
  }
}

export class CounterTestRunner extends NotImplementedTestRunner {
  private count = 0;
  public static COUNTER_FILE = `${os.tmpdir()}/stryker-js-test-counter-file`;

  public async dryRun(): Promise<DryRunResult> {
    return factory.completeDryRunResult();
  }

  public async mutantRun(): Promise<MutantRunResult> {
    this.count++;
    fs.writeFileSync(CounterTestRunner.COUNTER_FILE, `${this.count}`);
    return factory.survivedMutantRunResult();
  }
}

class DirectResolvedTestRunner extends NotImplementedTestRunner {
  public async dryRun(): Promise<DryRunResult> {
    (global as any).__mutantCoverage__ = 'coverageObject';
    return factory.completeDryRunResult();
  }
}

class DiscoverRegexTestRunner extends NotImplementedTestRunner {
  public static inject = tokens(commonTokens.options);
  constructor(private readonly options: StrykerOptions) {
    super();
  }

  public async dryRun(): Promise<DryRunResult> {
    if (types.isRegExp(this.options.someRegex)) {
      return factory.completeDryRunResult();
    } else {
      return factory.errorDryRunResult({ errorMessage: 'No regex found in runnerOptions.strykerOptions.someRegex' });
    }
  }
}

class ErroredTestRunner extends NotImplementedTestRunner {
  public async dryRun(): Promise<DryRunResult> {
    let expectedError: any = null;
    try {
      throw new SyntaxError('This is invalid syntax!');
    } catch (error) {
      expectedError = error;
    }
    return factory.errorDryRunResult({ errorMessage: expectedError });
  }

  public dispose(): Promise<void> {
    throw new Error('Test runner exited with exit code 1');
  }
}

class RejectInitRunner extends NotImplementedTestRunner {
  public init() {
    return Promise.reject(new Error('Init was rejected'));
  }

  public async dryRun(): Promise<DryRunResult> {
    throw new Error();
  }
}

class NeverResolvedTestRunner extends NotImplementedTestRunner {
  public dryRun(): Promise<DryRunResult> {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return new Promise<DryRunResult>(() => {});
  }
}

class SlowInitAndDisposeTestRunner extends NotImplementedTestRunner {
  public inInit = false;

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

  public dispose() {
    return this.init();
  }
}
class VerifyWorkingFolderTestRunner extends NotImplementedTestRunner {
  public async dryRun(): Promise<DryRunResult> {
    if (process.cwd().toLowerCase() === __dirname.toLowerCase()) {
      return factory.completeDryRunResult();
    } else {
      throw new Error(`Expected ${process.cwd()} to be ${__dirname}`);
    }
  }
}

class AsynchronousPromiseRejectionHandlerTestRunner extends NotImplementedTestRunner {
  public promise?: Promise<void>;

  public async init() {
    this.promise = Promise.reject('Reject for now, but will be caught asynchronously');
  }
  public async dryRun(): Promise<DryRunResult> {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this.promise!.catch(() => {});
    return factory.completeDryRunResult();
  }
}

class StaticMutantTestRunner extends NotImplementedTestRunner {
  public override async capabilities(): Promise<TestRunnerCapabilities> {
    return { reloadEnvironment: false };
  }
  public override async mutantRun(options: MutantRunOptions): Promise<MutantRunResult> {
    // Set the env variable and then load the active-mutant.js file, which reads it on load.
    // If it was the second run, it would result in survived
    process.env.activeMutant = options.activeMutant.id;
    const { activeMutant } = await import('./active-mutant.js');
    if (activeMutant === options.activeMutant.id) {
      return factory.killedMutantRunResult();
    } else {
      return factory.survivedMutantRunResult();
    }
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
  declareClassPlugin(PluginKind.TestRunner, 'counter', CounterTestRunner),
  declareClassPlugin(PluginKind.TestRunner, 'async-promise-rejection-handler', AsynchronousPromiseRejectionHandlerTestRunner),
  declareClassPlugin(PluginKind.TestRunner, 'reject-init', RejectInitRunner),
  declareClassPlugin(PluginKind.TestRunner, 'static', StaticMutantTestRunner),
];
