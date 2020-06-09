import { DryRunOptions, MutantRunOptions } from './RunOptions';
import { MutantRunResult, DryRunResult } from './RunResult';

export interface TestRunner2 {
  init?(): Promise<void> | void;
  dryRun(options: DryRunOptions): Promise<DryRunResult>;
  mutantRun(options: MutantRunOptions): Promise<MutantRunResult>;
  dispose?(): Promise<void> | void;
}
