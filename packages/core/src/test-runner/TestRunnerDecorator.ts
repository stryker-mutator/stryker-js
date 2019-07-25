import { RunOptions, RunResult, TestRunner } from '@stryker-mutator/api/test_runner';

export default class TestRunnerDecorator implements Required<TestRunner> {
  protected innerRunner: TestRunner;

  constructor(private readonly testRunnerProducer: () => TestRunner) {
    this.createInnerRunner();
  }

  public init(): Promise<void> {
    if (this.innerRunner.init) {
      return this.innerRunner.init() || Promise.resolve();
    } else {
      return Promise.resolve();
    }
  }

  protected createInnerRunner() {
    this.innerRunner = this.testRunnerProducer();
  }

  public run(options: RunOptions): Promise<RunResult> {
    return this.innerRunner.run(options);
  }

  public dispose(): Promise<any> {
    if (this.innerRunner.dispose) {
      return this.innerRunner.dispose() || Promise.resolve();
    } else {
      return Promise.resolve();
    }
  }
}
