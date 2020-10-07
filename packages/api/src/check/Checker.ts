import { Mutant } from '../../core';

import { CheckResult } from './CheckResult';

export interface Checker {
  init(): Promise<void>;

  check(mutant: Mutant): Promise<CheckResult>;
}
