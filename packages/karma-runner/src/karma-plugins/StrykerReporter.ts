import { EventEmitter } from 'events';

import { DryRunStatus, TestResult, TestStatus, MutantCoverage } from '@stryker-mutator/api/test_runner2';
import * as karma from 'karma';

export interface KarmaSpec {
  description: string;
  id: string;
  skipped: boolean;
  success: boolean;
  time: number;
  suite: string[];
  log: string[];
}

/**
 * This is a singleton implementation of a KarmaReporter.
 * It is loaded by karma and functions as a bridge between the karma world and the stryker world
 *
 * It uses properties as functions because karma is not able to find actual methods.
 *
 * i.e. use `public readonly onFoo = () => {}` instead of `onFoo() { }`.
 */
export class StrykerReporter extends EventEmitter implements karma.Reporter {
  public adapters: any[] = [];

  private constructor() {
    super();
  }

  private static _instance = new StrykerReporter();
  public static get instance(): StrykerReporter {
    if (!this._instance) {
      this._instance = new StrykerReporter();
    }
    return this._instance;
  }

  public readonly onListening = (port: number) => {
    this.emit('server_start', port);
  };

  public readonly onSpecComplete = (_browser: any, spec: KarmaSpec) => {
    const name = spec.suite.reduce((name, suite) => name + suite + ' ', '') + spec.description;
    const id = spec.id || name;
    let testResult: TestResult;
    if (spec.skipped) {
      testResult = {
        id,
        name,
        timeSpentMs: spec.time,
        status: TestStatus.Skipped,
      };
    } else if (spec.success) {
      testResult = {
        id,
        name,
        timeSpentMs: spec.time,
        status: TestStatus.Success,
      };
    } else {
      testResult = {
        id,
        name,
        timeSpentMs: spec.time,
        status: TestStatus.Failed,
        failureMessage: spec.log.join(','),
      };
    }
    this.emit('test_result', testResult);
  };

  public readonly onRunComplete = (runResult: karma.TestResults) => {
    this.emit('run_complete', this.collectRunState(runResult));
  };

  public readonly onLoadError = (...args: any[]) => {
    this.emit('load_error', ...args);
  };

  public readonly onBrowserComplete = (_browser: any, result: { mutantCoverage: MutantCoverage }) => {
    this.emit('coverage_report', result.mutantCoverage);
  };

  public readonly onBrowsersReady = () => {
    this.emit('browsers_ready');
  };

  public readonly onBrowserError = (_browser: any, error: any) => {
    // Karma 2.0 has different error messages
    if (error.message) {
      this.emit('browser_error', error.message);
    } else {
      this.emit('browser_error', error.toString());
    }
  };

  public readonly onCompileError = (errors: string[]) => {
    // This is called from angular cli logic
    // https://github.com/angular/angular-cli/blob/012672161087a05ae5ecffbed5d1ee307ce1e0ad/packages/angular_devkit/build_angular/src/angular-cli-files/plugins/karma.ts#L96
    this.emit('compile_error', errors);
  };

  private collectRunState(runResult: karma.TestResults): DryRunStatus {
    if (runResult.disconnected) {
      return DryRunStatus.Timeout;
    } else if (runResult.error) {
      return DryRunStatus.Error;
    } else {
      return DryRunStatus.Complete;
    }
  }
}
