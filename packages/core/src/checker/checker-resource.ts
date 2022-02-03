import { CheckResult } from '@stryker-mutator/api/check';
import { MutantTestCoverage } from '@stryker-mutator/api/core';

import { Resource } from '../concurrent';

export interface CheckerResource extends Resource {
  check(checkerName: string, mutant: MutantTestCoverage[]): Promise<Array<{ mutant: MutantTestCoverage; checkResult: CheckResult }>>;
  createGroups?(checkerName: string, mutants: MutantTestCoverage[]): Promise<MutantTestCoverage[][] | undefined>;
};
