import { TestRunner, DryRunOptions, MutantRunOptions, MutantRunResult, DryRunResult } from '@stryker-mutator/api/test-runner';
import { Disposable } from 'typed-inject';

export class TestRunnerDecorator implements Required<TestRunner>, Disposable {
  protected innerRunner!: TestRunner;

  constructor(private readonly testRunnerProducer: () => TestRunner) {
    this.createInnerRunner();
  }

  public init(): Promise<void> {
    if (this.innerRunner.init) {
      return this.innerRunner.init();
    } else {
      return Promise.resolve();
    }
  }
  protected createInnerRunner(): void {
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
