import { MutantTestCoverage } from '../core';

import { CheckResult } from './check-result';

export interface Checker {
  init(): Promise<void>;

  check(mutant: MutantTestCoverage[]): Promise<Array<{ mutant: MutantTestCoverage; checkResult: CheckResult }>>;

  createGroups?(mutants: MutantTestCoverage[]): Promise<MutantTestCoverage[][] | undefined>;
}
