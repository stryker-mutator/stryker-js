import { CheckResult } from '@stryker-mutator/api/check';
import { Mutant } from '@stryker-mutator/api/core';

import { Resource } from '../concurrent/index.js';

export interface CheckerResource extends Resource {
  check(
    checkerName: string,
    mutant: Mutant[],
  ): Promise<Record<string, CheckResult>>;
  group(checkerName: string, mutants: Mutant[]): Promise<string[][]>;
}
