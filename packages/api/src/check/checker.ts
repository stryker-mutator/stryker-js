import { Mutant } from '../core/index.js';

import { CheckResult } from './check-result.js';

export interface Checker {
  init(): Promise<void>;

  /**
   * Check a mutant group.
   * @param mutants A group of mutants to check
   * @returns key-value pairs of mutant ids with the check results
   */
  check(mutants: Mutant[]): Promise<Record<string, CheckResult>>;

  /**
   * Group mutants into groups to check.
   * If missing, groups of singular mutants are assumed.
   * @param mutants the mutants to group
   * @returns the groups of mutant ids
   */
  group?(mutants: Mutant[]): Promise<string[][]>;
}
