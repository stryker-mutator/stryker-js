import {
  type DryRunResult,
  DryRunStatus,
  type MutantRunResult,
  MutantRunStatus,
  type TestRunner,
  type TestRunnerCapabilities,
  TestStatus,
} from '@stryker-mutator/api/test-runner';
import { declareClassPlugin, PluginKind } from '@stryker-mutator/api/plugin';

export class NoopTestRunner implements TestRunner {
  public capabilities(): TestRunnerCapabilities {
    return {
      reloadEnvironment: true,
    };
  }

  public async dryRun(): Promise<DryRunResult> {
    return {
      status: DryRunStatus.Complete,
      tests: [
        {
          id: 'noop-test',
          name: 'Noop test',
          timeSpentMs: 1,
          status: TestStatus.Success,
        }
      ],      
    }
  }

  public async mutantRun(): Promise<MutantRunResult> {
    return {
      status: MutantRunStatus.Survived,
      nrOfTests: 0,
    };
  }

  public async dispose(): Promise<void> {
    // No disposal needed for the noop test runner
  }
}

export const strykerPlugins = [ declareClassPlugin(PluginKind.TestRunner, 'noop', NoopTestRunner) ];
