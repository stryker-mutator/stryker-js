import { TestRunner2, DryRunOptions, MutantRunOptions, MutantRunResult, DryRunResult } from '@stryker-mutator/api/test_runner2';
import { Disposable } from 'typed-inject';

export default class TestRunnerDecorator implements Required<TestRunner2>, Disposable {
  protected innerRunner: TestRunner2;

  constructor(private readonly testRunnerProducer: () => TestRunner2) {
    this.createInnerRunner();
  }

  public init(): Promise<void> {
    if (this.innerRunner.init) {
      return this.innerRunner.init();
    } else {
      return Promise.resolve();
    }
  }
  protected createInnerRunner() {
    this.innerRunner = this.testRunnerProducer();
  }

  public dryRun(options: DryRunOptions): Promise<DryRunResult> {
    return this.innerRunner.dryRun(options);
  }
  public mutantRun(options: MutantRunOptions): Promise<MutantRunResult> {
    return this.innerRunner.mutantRun(options);
  }

  public dispose(): Promise<any> {
    if (this.innerRunner.dispose) {
      return this.innerRunner.dispose();
    } else {
      return Promise.resolve();
    }
  }
}
