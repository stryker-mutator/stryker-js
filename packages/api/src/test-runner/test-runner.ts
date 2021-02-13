import { DryRunResult } from './dry-run-result';
import { MutantRunResult } from './mutant-run-result';
import { DryRunOptions, MutantRunOptions } from './run-options';

export interface TestRunner {
  init?(): Promise<void>;
  dryRun(options: DryRunOptions): Promise<DryRunResult>;
  mutantRun(options: MutantRunOptions): Promise<MutantRunResult>;
  dispose?(): Promise<void>;
}
