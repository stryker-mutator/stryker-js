import { MutatorDefinition } from '@stryker-mutator/api/core';

export interface MutatorOptions {
  includedMutations: MutatorDefinition[];
  excludedMutations: MutatorDefinition[];
  noHeader?: boolean;
}
