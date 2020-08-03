import { DryRunOptions, MutantRunOptions } from './RunOptions';
import { DryRunResult } from './DryRunResult';
import { MutantRunResult } from './MutantRunResult';

export interface TestRunner2 {
  init?(): Promise<void>;
  dryRun(options: DryRunOptions): Promise<DryRunResult>;
  mutantRun(options: MutantRunOptions): Promise<MutantRunResult>;
  dispose?(): Promise<void>;
}
