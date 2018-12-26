import { getLogger } from 'stryker-api/logging';
import { RunResult, RunStatus, TestStatus } from 'stryker-api/test_runner';
import Timer from './Timer';

export default class StrykerMochaReporter {

  public static CurrentInstance: StrykerMochaReporter | undefined;
  public runResult: RunResult;

  private readonly log = getLogger(StrykerMochaReporter.name);
  private passedCount = 0;
  private readonly timer = new Timer();

  constructor(private readonly runner: NodeJS.EventEmitter) {
    this.registerEvents();
    StrykerMochaReporter.CurrentInstance = this;
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
      this.log.debug('Starting Mocha test run');
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
      if (this.log.isTraceEnabled()) {
        this.log.trace(`Test failed: ${test.fullTitle()}. Error: ${err.message}`);
      }
    });

    this.runner.on('end', () => {
      this.runResult.status = RunStatus.Complete;
      this.log.debug('Mocha test run completed: %s/%s passed', this.passedCount, this.runResult.tests.length);
    });
  }
}
