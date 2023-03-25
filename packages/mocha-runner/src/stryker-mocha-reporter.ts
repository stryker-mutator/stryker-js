import { Logger } from '@stryker-mutator/api/logging';
import { FailedTestResult, TestResult, SuccessTestResult, TestStatus } from '@stryker-mutator/api/test-runner';
import { I } from '@stryker-mutator/util';

import { Timer } from './timer.js';

export class StrykerMochaReporter {
  /*
   * The stryker logger instance injected into this plugin
   * Needs to be set from 'the outside' because mocha doesn't really have a nice way of providing
   * data to reporters...
   */
  public static log: Logger | undefined;
  private readonly timer = new Timer();
  private passedCount = 0;
  public tests: TestResult[] = [];

  public static currentInstance: I<StrykerMochaReporter> | undefined;

  constructor(private readonly runner: NodeJS.EventEmitter) {
    this.registerEvents();
    StrykerMochaReporter.currentInstance = this;
  }

  private registerEvents() {
    this.runner.on('start', () => {
      this.passedCount = 0;
      this.timer.reset();
      this.tests = [];
      StrykerMochaReporter.log?.debug('Starting Mocha test run');
    });

    this.runner.on('pass', (test: Mocha.Test) => {
      const title: string = test.fullTitle();
      const result: SuccessTestResult = {
        id: title,
        name: title,
        status: TestStatus.Success,
        timeSpentMs: this.timer.elapsedMs(),
        fileName: test.file,
      };
      this.tests.push(result);
      this.passedCount++;
      this.timer.reset();
    });

    this.runner.on('fail', (test: Mocha.Hook | Mocha.Test, err: Error) => {
      const title = test.ctx?.currentTest?.fullTitle() ?? test.fullTitle();
      const result: FailedTestResult = {
        id: title,
        failureMessage: (err.message || err.stack) ?? '<empty failure message>',
        name: title,
        status: TestStatus.Failed,
        timeSpentMs: this.timer.elapsedMs(),
      };
      this.tests.push(result);
      if (StrykerMochaReporter.log?.isTraceEnabled()) {
        StrykerMochaReporter.log?.trace(`Test failed: ${test.fullTitle()}. Error: ${err.message}`);
      }
    });

    this.runner.on('end', () => {
      StrykerMochaReporter.log?.debug('Mocha test run completed: %s/%s passed', this.passedCount, this.tests.length);
    });
  }
}
