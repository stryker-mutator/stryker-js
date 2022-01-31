import { Mutant } from '../core/index.js';

import { CheckResult } from './check-result.js';

export interface Checker {
  init(): Promise<void>;

  check(mutant: Mutant): Promise<CheckResult>;
}
