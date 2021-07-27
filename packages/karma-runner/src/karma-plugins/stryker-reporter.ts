import { DryRunResult, DryRunStatus, TestResult, TestStatus } from '@stryker-mutator/api/test-runner';
import { MutantCoverage } from '@stryker-mutator/api/core';
import karma from 'karma';
import { Task } from '@stryker-mutator/util';

export interface KarmaSpec {
  description: string;
  id: string;
  skipped: boolean;
  success: boolean;
  time: number;
  suite: string[];
  log: string[];
}

interface Browser {
  id: string;
  state: string;
}

export function strykerReporterFactory(karmaServer: karma.Server, config: karma.Config): StrykerReporter {
  StrykerReporter.instance.karmaServer = karmaServer;
  StrykerReporter.instance.karmaConfig = config;
  return StrykerReporter.instance;
}
strykerReporterFactory.$inject = ['server', 'config'];

/**
 * This is a singleton implementation of a KarmaReporter.
 * It is loaded by karma and functions as a bridge between the karma world and the stryker world
 *
 * It uses properties as functions because karma is not able to find actual methods.
 *
 * i.e. use `public readonly onFoo = () => {}` instead of `onFoo() { }`.
 */
export class StrykerReporter implements karma.Reporter {
  public adapters: any[] = [];
  public karmaServer: karma.Server | undefined;
  public karmaConfig: karma.Config | undefined;
  public runResultHandler: ((result: DryRunResult) => void) | undefined;
  private testResults: TestResult[] = [];
  private errorMessage: string | undefined;
  private mutantCoverage: MutantCoverage | undefined;
  private initTask: Task | undefined;
  private runTask: Task<DryRunResult> | undefined;
  private karmaRunResult: karma.TestResults | undefined;
  private browserIsRestarting = false;

  private static readonly _instance = new StrykerReporter();
  public static get instance(): StrykerReporter {
    return this._instance;
  }

  public readonly onBrowsersReady = (_s: unknown, browsers: unknown[]): void => {
    this.initTask?.resolve();
    this.runTask?.resolve(this.collectRunResult());
  };

  public whenBrowsersReady(): Promise<void> {
    this.initTask = new Task();
    return this.initTask.promise.finally(() => {
      this.initTask = undefined;
    });
  }

  public whenRunCompletes(): Promise<DryRunResult> {
    this.runTask = new Task();
    return this.runTask.promise.finally(() => {
      this.runTask = undefined;
    });
  }

  public readonly onSpecComplete: (_browser: any, spec: KarmaSpec) => void = (_browser: any, spec: KarmaSpec) => {
    const name = spec.suite.reduce((specName, suite) => specName + suite + ' ', '') + spec.description;
    const id = spec.id || name;
    if (spec.skipped) {
      this.testResults.push({
        id,
        name,
        timeSpentMs: spec.time,
        status: TestStatus.Skipped,
      });
    } else if (spec.success) {
      this.testResults.push({
        id,
        name,
        timeSpentMs: spec.time,
        status: TestStatus.Success,
      });
    } else {
      this.testResults.push({
        id,
        name,
        timeSpentMs: spec.time,
        status: TestStatus.Failed,
        failureMessage: spec.log.join(','),
      });
    }
  };

  public readonly onRunStart = (): void => {
    this.testResults = [];
    this.errorMessage = undefined;
    this.mutantCoverage = undefined;
    this.karmaRunResult = undefined;
    this.browserIsRestarting = false;
  };

  public readonly onRunComplete = (_browsers: unknown, runResult: karma.TestResults): void => {
    this.karmaRunResult = runResult;
    if (!this.browserIsRestarting) {
      this.runTask?.resolve(this.collectRunResult());
    }
  };

  public readonly onBrowserComplete: (
    _browser: any,
    result: {
      mutantCoverage: MutantCoverage;
    }
  ) => void = (_browser: any, result: { mutantCoverage: MutantCoverage }) => {
    this.mutantCoverage = result.mutantCoverage;
  };

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public readonly onBrowserError = (browser: Browser, error: any): void => {
    // Karma 2.0 has different error messages
    if (this.initTask) {
      this.initTask.reject(error);
    } else {
      if (browser.state.toUpperCase().includes('DISCONNECTED')) {
        // Restart the browser for next run
        this.karmaServer!.get('launcher').restart(browser.id);
        this.browserIsRestarting = true;
      }
      if (error.message) {
        this.errorMessage = error.message;
      } else {
        this.errorMessage = error.toString();
      }
    }
  };

  private collectRunResult(): DryRunResult {
    if (this.karmaRunResult?.disconnected) {
      return { status: DryRunStatus.Timeout };
    } else if (this.karmaRunResult?.error) {
      return { status: DryRunStatus.Error, errorMessage: this.errorMessage ?? 'A runtime error occurred' };
    } else {
      return { status: DryRunStatus.Complete, tests: this.testResults, mutantCoverage: this.mutantCoverage };
    }
  }
}
