import { DryRunOptions, DryRunResult, MutantRunOptions, MutantRunResult, TestRunnerCapabilities } from '@stryker-mutator/api/test-runner';

import { TestRunnerDecorator } from './test-runner-decorator';

enum TestEnvironmentState {
  Pristine,
  Loaded,
  LoadedStaticMutant,
}

export class ReloadEnvironmentDecorator extends TestRunnerDecorator {
  private _capabilities?: TestRunnerCapabilities;
  private testEnvironment = TestEnvironmentState.Pristine;

  public override async capabilities(): Promise<TestRunnerCapabilities> {
    if (!this._capabilities) {
      this._capabilities = await super.capabilities();
    }
    return this._capabilities;
  }

  public override async dryRun(options: DryRunOptions): Promise<DryRunResult> {
    this.testEnvironment = TestEnvironmentState.Loaded;
    return super.dryRun(options);
  }

  public override async mutantRun(options: MutantRunOptions): Promise<MutantRunResult> {
    let newState: TestEnvironmentState;
    if (options.testFilter) {
      // Mutant is not static
      newState = TestEnvironmentState.Loaded;
      if (this.testEnvironment === TestEnvironmentState.LoadedStaticMutant) {
        // loaded a static mutant in previous run, need to reload first
        await this.recover();
      }
    } else {
      // Mutant is static
      newState = TestEnvironmentState.LoadedStaticMutant;
      if (await this.innerTestRunnerCanReload()) {
        // Test runner is capable of reloading by itself (i.e. jest or karma)
        options.reloadEnvironment = this.testEnvironment !== TestEnvironmentState.Pristine;
      } else if (this.testEnvironment !== TestEnvironmentState.Pristine) {
        // Test runner needs to restart, since the environment isn't pristine
        await this.recover();
      }
    }
    const result = await super.mutantRun(options);
    this.testEnvironment = newState;
    return result;
  }

  private async innerTestRunnerCanReload() {
    return (await this.capabilities()).reloadEnvironment;
  }
}
