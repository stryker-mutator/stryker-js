import {
  DryRunOptions,
  DryRunResult,
  MutantRunOptions,
  MutantRunResult,
  TestRunnerCapabilities,
} from '@stryker-mutator/api/test-runner';

import { TestRunnerDecorator } from './test-runner-decorator.js';

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

  public override async mutantRun(
    options: MutantRunOptions,
  ): Promise<MutantRunResult> {
    let newState: TestEnvironmentState;
    if (options.reloadEnvironment) {
      newState = TestEnvironmentState.LoadedStaticMutant;

      // If env is still pristine (first run), no reload is actually needed
      options.reloadEnvironment =
        this.testEnvironment !== TestEnvironmentState.Pristine;

      if (
        options.reloadEnvironment &&
        !(await this.testRunnerIsCapableOfReload())
      ) {
        await this.recover();
        options.reloadEnvironment = false;
      }
    } else {
      // Reload might still be needed actually, since a static mutant could be loaded
      newState = TestEnvironmentState.Loaded;
      if (this.testEnvironment === TestEnvironmentState.LoadedStaticMutant) {
        // Test env needs reloading
        if (await this.testRunnerIsCapableOfReload()) {
          options.reloadEnvironment = true;
        } else {
          // loaded a static mutant in previous run, need to reload first
          await this.recover();
        }
      }
    }
    const result = await super.mutantRun(options);
    this.testEnvironment = newState;
    return result;
  }

  private async testRunnerIsCapableOfReload() {
    return (await this.capabilities()).reloadEnvironment;
  }
}
