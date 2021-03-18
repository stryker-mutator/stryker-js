import { MutationRange } from '@stryker-mutator/api/core';

export interface MutatorOptions {
  excludedMutations: string[];
  mutationRange: readonly MutationRange[];
}
