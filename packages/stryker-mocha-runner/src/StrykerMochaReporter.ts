import { RunResult, RunStatus, TestStatus } from 'stryker-api/test_runner';
import * as log4js from 'log4js';
import Timer from './Timer';

const log = log4js.getLogger('StrykerMochaReporter');

export default class StrykerMochaReporter {

  private runResult: RunResult;
  private timer = new Timer();
  private passedCount = 0;

  constructor(private runner: NodeJS.EventEmitter) {
    this.registerEvents();
  }

  private registerEvents() {
    this.runner.on('start', () => {
      this.passedCount = 0;
      this.timer.reset();
      this.runResult = {
        status: RunStatus.Error,
        tests: [],
        errorMessages: []
      };
      log.debug('Starting Mocha test run');
    });

    this.runner.on('pass', (test: any) => {
      this.runResult.tests.push({
        status: TestStatus.Success,
        name: test.fullTitle(),
        timeSpentMs: this.timer.elapsedMs()
      });
      this.passedCount++;
      this.timer.reset();
      log.debug(`Test passed: ${test.fullTitle()}`);
    });

    this.runner.on('fail', (test: any, err: any) => {
      this.runResult.tests.push({
        status: TestStatus.Failed,
        name: test.fullTitle(),
        timeSpentMs: this.timer.elapsedMs(),
        failureMessages: [err.message]
      });
      if (!this.runResult.errorMessages) {
        this.runResult.errorMessages = [];
      }
      this.runResult.errorMessages.push(err.message);
      log.debug(`Test failed: ${test.fullTitle()}. Error: ${err.message}`);
    });

    this.runner.on('end', () => {
      this.runResult.status = RunStatus.Complete;
      (this.runner as any).runResult = this.runResult;
      log.debug(`Mocha test run completed: ${this.passedCount}/${this.runResult.tests.length} passed`);
    });
  }
}