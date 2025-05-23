import {
  determineHitLimitReached,
  DryRunResult,
  DryRunStatus,
  TestResult,
  TestStatus,
} from '@stryker-mutator/api/test-runner';
import { MutantCoverage } from '@stryker-mutator/api/core';
import type karma from 'karma';
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

export interface Browser {
  id: string;
  state: string;
}

export function strykerReporterFactory(
  karmaServer: karma.Server,
  config: karma.Config,
): StrykerReporter {
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
  private hitCount: number | undefined;
  private hitLimit: number | undefined;
  private initTask: Task | undefined;
  private runTask: Task<DryRunResult> | undefined;
  private karmaRunResult: karma.TestResults | undefined;
  private browserIsRestarting = false;

  private static readonly _instance = new StrykerReporter();
  public static get instance(): StrykerReporter {
    return this._instance;
  }

  public readonly onBrowsersReady = (): void => {
    this.initTask?.resolve();
    this.runTask?.resolve(this.collectRunResult());
  };

  public configureHitLimit(hitLimit: number | undefined): void {
    this.hitLimit = hitLimit;
    this.hitCount = undefined;
  }

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

  public readonly onSpecComplete = (
    _browser: unknown,
    spec: KarmaSpec,
  ): void => {
    const name =
      spec.suite.reduce((specName, suite) => specName + suite + ' ', '') +
      spec.description;
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
        failureMessage: spec.log.join(', '),
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

  public readonly onRunComplete = (
    _browsers: unknown,
    runResult: karma.TestResults,
  ): void => {
    this.karmaRunResult = runResult;
    if (!this.browserIsRestarting) {
      this.runTask!.resolve(this.collectRunResult());
    }
  };

  public readonly onBrowserComplete = (
    _browser: unknown,
    result: {
      mutantCoverage: MutantCoverage | undefined;
      hitCount: number | undefined;
    },
  ): void => {
    this.mutantCoverage = result.mutantCoverage;
    this.hitCount = result.hitCount;
  };

  public readonly onBrowserError = (browser: Browser, error: any): void => {
    if (this.initTask) {
      this.initTask.reject(error);
    } else {
      if (browser.state.toUpperCase().includes('DISCONNECTED')) {
        // Restart the browser for next run
        this.karmaServer!.get('launcher').restart(browser.id);
        this.browserIsRestarting = true;
      }
      // Karma 2.0 has different error messages
      if (error.message) {
        this.errorMessage = error.message;
      } else {
        this.errorMessage = error.toString();
      }
    }
  };

  private collectRunResult(): DryRunResult {
    const timeoutResult = determineHitLimitReached(
      this.hitCount,
      this.hitLimit,
    );
    if (timeoutResult) {
      return timeoutResult;
    }
    if (this.karmaRunResult?.disconnected) {
      return {
        status: DryRunStatus.Timeout,
        reason: `Browser disconnected during test execution. Karma error: ${this.errorMessage}`,
      };
    } else if (this.karmaRunResult?.error) {
      return {
        status: DryRunStatus.Error,
        errorMessage: this.errorMessage ?? 'A runtime error occurred',
      };
    } else {
      return {
        status: DryRunStatus.Complete,
        tests: this.testResults,
        mutantCoverage: this.mutantCoverage,
      };
    }
  }
}
