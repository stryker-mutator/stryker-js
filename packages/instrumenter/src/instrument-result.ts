import { Mutant } from '@stryker-mutator/api/core';

import { File } from './file.js';

export interface InstrumentResult {
  files: readonly File[];
  mutants: readonly Mutant[];
}
