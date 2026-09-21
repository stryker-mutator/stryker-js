import {
  DryRunOptions,
  DryRunResult,
  MutantRunOptions,
  MutantRunResult,
  TestRunner,
  TestRunnerCapabilities,
} from '@stryker-mutator/api/test-runner';

import { PerformanceMetricsSink } from '../performance-metrics-sink.js';
import { Timer } from '../utils/timer.js';

import { TestRunnerDecorator } from './test-runner-decorator.js';

enum TestEnvironmentState {
  Pristine,
  Loaded,
  LoadedStaticMutant,
}

export class ReloadEnvironmentDecorator extends TestRunnerDecorator {
  private _capabilities?: TestRunnerCapabilities;
  private testEnvironment = TestEnvironmentState.Pristine;

  constructor(
    producer: () => TestRunner,
    private readonly performanceMetricsSink: PerformanceMetricsSink,
  ) {
    super(producer);
  }

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
    let reloaded = false;
    let recoverMs = 0;
    if (options.reloadEnvironment) {
      newState = TestEnvironmentState.LoadedStaticMutant;

      // If env is still pristine (first run), no reload is actually needed
      options.reloadEnvironment =
        this.testEnvironment !== TestEnvironmentState.Pristine;

      if (options.reloadEnvironment) {
        reloaded = true;
        if (!(await this.testRunnerIsCapableOfReload())) {
          recoverMs = await this.timeRecover();
          options.reloadEnvironment = false;
        }
      }
    } else {
      // Reload might still be needed actually, since a static mutant could be loaded
      newState = TestEnvironmentState.Loaded;
      if (this.testEnvironment === TestEnvironmentState.LoadedStaticMutant) {
        // Test env needs reloading
        reloaded = true;
        if (await this.testRunnerIsCapableOfReload()) {
          options.reloadEnvironment = true;
        } else {
          // loaded a static mutant in previous run, need to reload first
          recoverMs = await this.timeRecover();
        }
      }
    }
    const result = await super.mutantRun(options);
    this.testEnvironment = newState;
    if (reloaded) {
      this.performanceMetricsSink.recordReload(
        options.activeMutant.id,
        recoverMs,
      );
    }
    return result;
  }

  private async timeRecover(): Promise<number> {
    const timer = new Timer();
    await this.recover();
    return timer.elapsedMs();
  }

  private async testRunnerIsCapableOfReload() {
    return (await this.capabilities()).reloadEnvironment;
  }
}
