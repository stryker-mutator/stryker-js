import { CheckResult } from '@stryker-mutator/api/check';
import { Mutant, MutantTestCoverage } from '@stryker-mutator/api/core';

import { Resource } from '../concurrent';

export interface CheckerResource extends Resource {
  check(checkerName: string, mutant: Mutant[]): Promise<Record<string, CheckResult>>;
  createGroups?(checkerName: string, mutants: MutantTestCoverage[]): Promise<MutantTestCoverage[][] | undefined>;
}
