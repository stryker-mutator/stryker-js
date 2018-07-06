import { TestStatus, TestResult, CoverageCollection, CoverageCollectionPerTest, RunStatus } from 'stryker-api/test_runner';
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
 * It is loaded by 
 */
export default class StrykerReporter extends EventEmitter implements karma.Reporter {

  adapters: any[] = [];
  
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

  onSpecComplete(browser: any, spec: KarmaSpec) {
    const name = spec.suite.reduce((name, suite) => name + suite + ' ', '') + spec.description;
    let status = TestStatus.Failed;
    if (spec.skipped) {
      status = TestStatus.Skipped;
    } else if (spec.success) {
      status = TestStatus.Success;
    }
    const testResult: TestResult = {
      name,
      status,
      timeSpentMs: spec.time,
      failureMessages: spec.log
    };
    this.emit('test_result', testResult);
  }

  onRunComplete(runResult: karma.TestResults) {
    this.emit('run_complete', this.collectRunState(runResult));
  }

  onBrowserComplete(browser: any, result: { coverage: CoverageCollection | CoverageCollectionPerTest }) {
    this.emit('coverage_report', result.coverage);
  }

  onBrowsersReady() {
    this.emit('browsers_ready');
  }

  onBrowserError(browser: any, error: any) {
    // Karma 2.0 has different error messages
    if (error.message) {
      this.emit('browser_error', error.message);
    } else {
      this.emit('browser_error', error.toString());
    }
  }

  onCompileError(errors: string[]) {
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