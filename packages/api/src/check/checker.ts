import { Mutant } from '../core/index.js';

import { CheckResult } from './check-result.js';

export interface Checker {
  init(): Promise<void>;

  check(mutants: Mutant[]): Promise<Record<string, CheckResult>>;

  createGroups?(mutants: Mutant[]): Promise<Mutant[][] | undefined>;
}
