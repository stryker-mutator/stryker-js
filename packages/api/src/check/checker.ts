import { Mutant, MutantTestCoverage } from '../core';

import { CheckResult } from './check-result';

export interface Checker {
  init(): Promise<void>;

  check(mutant: Mutant[]): Promise<Record<string, CheckResult>>;

  createGroups?(mutants: MutantTestCoverage[]): Promise<MutantTestCoverage[][] | undefined>;
}
