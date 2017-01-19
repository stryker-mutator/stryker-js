import { EventEmitter } from 'events';
import { TestRunner, RunOptions, RunResult } from 'stryker-api/test_runner';

export default class TestRunnerDecorator extends EventEmitter implements TestRunner {
  protected innerRunner: TestRunner;

  constructor(private testRunnerProducer: () => TestRunner) {
    super();
    this.createInnerRunner();
  }

  init(): Promise<any> {
    return this.innerRunner.init() || Promise.resolve();
  }

  protected createInnerRunner() {
    this.innerRunner = this.testRunnerProducer();
  }

  run(options: RunOptions): Promise<RunResult> {
    return this.innerRunner.run(options);
  }

  dispose(): Promise<any> {
    return this.innerRunner.dispose() || Promise.resolve();
  }


}