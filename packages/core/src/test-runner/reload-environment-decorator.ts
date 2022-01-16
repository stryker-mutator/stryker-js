import { MutantRunOptions, MutantRunResult, TestRunnerCapabilities } from '@stryker-mutator/api/test-runner';

import { TestRunnerDecorator } from './test-runner-decorator';

export class ReloadEnvironmentDecorator extends TestRunnerDecorator {
  private _capabilities?: TestRunnerCapabilities;
  private loadedStaticMutant = false;

  public override async capabilities(): Promise<TestRunnerCapabilities> {
    if (!this._capabilities) {
      this._capabilities = await super.capabilities();
    }
    return this._capabilities;
  }

  public override async mutantRun(options: MutantRunOptions): Promise<MutantRunResult> {
    if (!options.testFilter) {
      if (!(await this.capabilities()).reloadEnvironment) {
        await this.recover();
        this.loadedStaticMutant = true;
      } else {
        options.reloadEnvironment = true;
      }
    } else if (this.loadedStaticMutant) {
      // loaded static mutant in previous run
      await this.recover();
      this.loadedStaticMutant = false;
    }
    return super.mutantRun(options);
  }
}
