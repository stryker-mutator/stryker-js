import { DryRunOptions, MutantRunOptions, MutantRunOptionsWithDisableBail } from './run-options';
import { DryRunResult } from './dry-run-result';
import { MutantRunResult } from './mutant-run-result';

export interface TestRunner {
  init?(): Promise<void>;
  dryRun(options: DryRunOptions): Promise<DryRunResult>;
  mutantRun(options: MutantRunOptions | MutantRunOptionsWithDisableBail): Promise<MutantRunResult>;
  dispose?(): Promise<void>;
}
