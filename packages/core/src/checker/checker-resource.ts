import { CheckResult } from '@stryker-mutator/api/check';
import { Mutant } from '@stryker-mutator/api/src/core';

import { Resource } from '../concurrent/index.js';

export interface CheckerResource extends Resource {
  check(checkerIndex: number, mutant: Mutant[]): Promise<Record<string, CheckResult>>;
  createGroups?(checkerIndex: number, mutants: Mutant[]): Promise<Mutant[][] | undefined>;
}
