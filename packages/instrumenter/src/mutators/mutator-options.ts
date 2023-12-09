import { MutationSpecification } from '@stryker-mutator/api/core';

export interface MutatorOptions {
  includedMutations: MutationSpecification[];
  excludedMutations: MutationSpecification[];
  noHeader?: boolean;
}
