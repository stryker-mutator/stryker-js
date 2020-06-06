import { Mutant } from '../../core';

import { CheckResult } from './CheckResult';

export interface Checker {
  initialize(): Promise<void>;

  check(mutant: Mutant): Promise<CheckResult>;
}
