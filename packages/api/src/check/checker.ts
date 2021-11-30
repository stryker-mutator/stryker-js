import { Mutant } from '../core';

import { CheckResult } from './check-result';

export interface Checker {
  init(): Promise<void>;

  check(mutant: Mutant[]): Promise<Array<{ mutant: Mutant; checkResult: CheckResult }>>;

  createGroups?(mutants: Mutant[]): Promise<Mutant[][] | undefined>;
}
