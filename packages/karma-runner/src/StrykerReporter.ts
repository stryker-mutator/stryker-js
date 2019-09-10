import { CoverageCollection, CoverageCollectionPerTest, RunStatus, TestResult, TestStatus } from '@stryker-mutator/api/test_runner';
import { EventEmitter } from 'events';
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
export default class StrykerReporter extends EventEmitter implements karma.Reporter {

  public adapters: any[] = [];

  private constructor() {

    super();
  }

  private static _instance = new StrykerReporter();
  static get instance(): StrykerReporter {
    if (!this._instance) {
      this._instance = new StrykerReporter();
    }
    return this._instance;
  }

  public readonly onListening = (port: number) => {
    this.emit('server_start', port);
  }

  public readonly onSpecComplete = (_browser: any, spec: KarmaSpec) => {
    const name = spec.suite.reduce((name, suite) => name + suite + ' ', '') + spec.description;
    let status = TestStatus.Failed;
    if (spec.skipped) {
      status = TestStatus.Skipped;
    } else if (spec.success) {
      status = TestStatus.Success;
    }
    const testResult: TestResult = {
      failureMessages: spec.log,
      name,
      status,
      timeSpentMs: spec.time
    };
    this.emit('test_result', testResult);
  }

  public readonly onRunComplete = (runResult: karma.TestResults) => {
    this.emit('run_complete', this.collectRunState(runResult));
  }

  public readonly onLoadError = (...args: any[]) => {
    this.emit('load_error', ...args);
  }

  public readonly onBrowserComplete = (_browser: any, result: { coverage: CoverageCollection | CoverageCollectionPerTest }) => {
    this.emit('coverage_report', result.coverage);
  }

  public readonly onBrowsersReady = () => {
    this.emit('browsers_ready');
  }

  public readonly onBrowserError = (_browser: any, error: any) => {
    // Karma 2.0 has different error messages
    if (error.message) {
      this.emit('browser_error', error.message);
    } else {
      this.emit('browser_error', error.toString());
    }
  }

  public readonly onCompileError = (errors: string[]) => {
    // This is called from angular cli logic
    // https://github.com/angular/angular-cli/blob/012672161087a05ae5ecffbed5d1ee307ce1e0ad/packages/angular_devkit/build_angular/src/angular-cli-files/plugins/karma.ts#L96
    this.emit('compile_error', errors);
  }

  private collectRunState(runResult: karma.TestResults): RunStatus {
    if (runResult.disconnected) {
      return RunStatus.Timeout;
    } else if (runResult.error) {
      return RunStatus.Error;
    } else {
      return RunStatus.Complete;
    }
  }

}
