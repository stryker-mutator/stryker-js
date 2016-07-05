import {RunResult, TestResult} from 'stryker-api/test_runner';
import * as log4js from 'log4js';

const log = log4js.getLogger('StrykerMochaReporter');

export default class StrykerMochaReporter {
  private runResult: RunResult = {
    result: TestResult.Error,
    testNames: <string[]>[],
    succeeded: 0,
    failed: 0,
    timeSpent: 0,
    errorMessages: <string[]>[]
  };
  private startDate: Date;

  constructor(runner: any) {
    this.registerEvents(runner);
  }

  private registerEvents(runner: any) {
    runner.on('start', () => {
      this.startDate = new Date();

      log.debug('Starting Mocha test run');
    });

    runner.on('pass', (test: any) => {
      this.runResult.succeeded++;
      this.runResult.testNames.push(test.fullTitle());

      log.debug(`Test passed: ${test.fullTitle()}`);
    });

    runner.on('fail', (test: any, err: any) => {
      this.runResult.failed++;
      this.runResult.testNames.push(test.fullTitle());
      this.runResult.errorMessages.push(err.message);

      log.debug(`Test failed: ${test.fullTitle()}. Error: ${err.message}`);
    });

    runner.on('end', () => {
      this.runResult.result = TestResult.Complete;
      this.runResult.timeSpent = new Date().getTime() - this.startDate.getTime();

      runner.runResult = this.runResult;

      log.debug(`Mocha test run completed: ${this.runResult.succeeded}/${this.runResult.succeeded + this.runResult.failed} passed`);
    });
  }
}