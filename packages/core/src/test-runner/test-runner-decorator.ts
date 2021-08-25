import { TestRunner, DryRunOptions, MutantRunOptions, MutantRunResult, DryRunResult } from '@stryker-mutator/api/test-runner';

import { ResourceDecorator } from '../concurrent';

export class TestRunnerDecorator extends ResourceDecorator<TestRunner> {
  public dryRun(options: DryRunOptions): Promise<DryRunResult> {
    return this.innerResource.dryRun(options);
  }
  public mutantRun(options: MutantRunOptions): Promise<MutantRunResult> {
    return this.innerResource.mutantRun(options);
  }
}
