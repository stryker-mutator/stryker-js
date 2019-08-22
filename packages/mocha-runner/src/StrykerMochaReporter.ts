import { Logger } from '@stryker-mutator/api/logging';
import { RunResult, RunStatus, TestStatus } from '@stryker-mutator/api/test_runner';
import Timer from './Timer';

export class StrykerMochaReporter {

  /*
   * The stryker logger instance injected into this plugin
   * Needs to be set from 'the outside' because mocha doesn't really have a nice way of providing
   * data to reporters...
   */
  public static log: Logger;
  public runResult: RunResult;
  private readonly timer = new Timer();
  private passedCount = 0;

  public static currentInstance: StrykerMochaReporter | undefined;

  constructor(private readonly runner: NodeJS.EventEmitter) {
    this.registerEvents();
    StrykerMochaReporter.currentInstance = this;
  }

  private registerEvents() {
    this.runner.on('start', () => {
      this.passedCount = 0;
      this.timer.reset();
      this.runResult = {
        errorMessages: [],
        status: RunStatus.Error,
        tests: []
      };
      StrykerMochaReporter.log.debug('Starting Mocha test run');
    });

    this.runner.on('pass', (test: any) => {
      this.runResult.tests.push({
        name: test.fullTitle(),
        status: TestStatus.Success,
        timeSpentMs: this.timer.elapsedMs()
      });
      this.passedCount++;
      this.timer.reset();
    });

    this.runner.on('fail', (test: any, err: any) => {
      this.runResult.tests.push({
        failureMessages: [err.message],
        name: test.fullTitle(),
        status: TestStatus.Failed,
        timeSpentMs: this.timer.elapsedMs()
      });
      if (!this.runResult.errorMessages) {
        this.runResult.errorMessages = [];
      }
      this.runResult.errorMessages.push(err.message);
      if (StrykerMochaReporter.log.isTraceEnabled()) {
        StrykerMochaReporter.log.trace(`Test failed: ${test.fullTitle()}. Error: ${err.message}`);
      }
    });

    this.runner.on('end', () => {
      this.runResult.status = RunStatus.Complete;
      StrykerMochaReporter.log.debug('Mocha test run completed: %s/%s passed', this.passedCount, this.runResult.tests.length);
    });
  }
}
