import { MutationRange } from '@stryker-mutator/api/core';

import { MutatorOptions } from '../mutators';

export interface TransformerOptions extends MutatorOptions {
  mutationRanges: readonly MutationRange[];
}
