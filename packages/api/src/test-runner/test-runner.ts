import { DryRunOptions, MutantRunOptions } from './run-options';
import { DryRunResult } from './dry-run-result';
import { MutantRunResult } from './mutant-run-result';
import { TestRunnerCapabilities } from './test-runner-capabilities';

export interface TestRunner {
  capabilities(): Promise<TestRunnerCapabilities>;
  init?(): Promise<void>;
  dryRun(options: DryRunOptions): Promise<DryRunResult>;
  mutantRun(options: MutantRunOptions): Promise<MutantRunResult>;
  dispose?(): Promise<void>;
}
