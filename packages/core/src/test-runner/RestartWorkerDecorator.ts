import { DryRunResult, DryRunOptions, MutantRunResult, MutantRunOptions } from '@stryker-mutator/api/test_runner';

import TestRunnerDecorator from './TestRunnerDecorator';

/**
 * Wraps a test runner and implements the retry functionality.
 */
export default class RestartWorkerDecorator extends TestRunnerDecorator {
  private runs = 0;

  public async dryRun(options: DryRunOptions): Promise<DryRunResult> {
    const results = super.dryRun(options);

    await this.recover();
    return results;
  }

  public async mutantRun(options: MutantRunOptions): Promise<MutantRunResult> {
    this.runs++;
    if (this.runs > 20) {
      await this.recover();
    }

    return super.mutantRun(options);
  }

  private async recover(): Promise<void> {
    await this.dispose();
    this.createInnerRunner();
    return this.init();
  }

  dispose(): Promise<any> {
    this.runs = 0;
    return super.dispose();
  }
}
