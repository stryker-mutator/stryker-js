import { Mutant } from '../../mutant';

import { CheckResult } from './CheckResult';

export interface Checker {
  initialize(): Promise<void>;

  check(mutant: Mutant): Promise<CheckResult>;
}
