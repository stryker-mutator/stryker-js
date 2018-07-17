import { RunResult, RunStatus, TestStatus } from 'stryker-api/test_runner';
import { getLogger } from 'stryker-api/logging';
import Timer from './Timer';

export default class StrykerMochaReporter {
  
  private readonly log = getLogger(StrykerMochaReporter.name);
  public runResult: RunResult;
  private timer = new Timer();
  private passedCount = 0;

  static CurrentInstance: StrykerMochaReporter | undefined;

  constructor(private runner: NodeJS.EventEmitter) {
    this.registerEvents();
    StrykerMochaReporter.CurrentInstance = this;
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
      this.log.debug('Starting Mocha test run');
    });

    this.runner.on('pass', (test: any) => {
      this.runResult.tests.push({
        status: TestStatus.Success,
        name: test.fullTitle(),
        timeSpentMs: this.timer.elapsedMs()
      });
      this.passedCount++;
      this.timer.reset();
      this.log.debug(`Test passed: ${test.fullTitle()}`);
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
      this.log.debug(`Test failed: ${test.fullTitle()}. Error: ${err.message}`);
    });

    this.runner.on('end', () => {
      this.runResult.status = RunStatus.Complete;
      this.log.debug(`Mocha test run completed: ${this.passedCount}/${this.runResult.tests.length} passed`);
    });
  }
}