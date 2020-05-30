import { File } from '@stryker-mutator/api/core';

import { Mutant } from './mutant';

export interface InstrumentResult {
  files: readonly File[];
  mutants: readonly Mutant[];
}
