import { Mutant } from '@stryker-mutator/api/core';
import { File } from '@stryker-mutator/util';

export interface InstrumentResult {
  files: readonly File[];
  mutants: readonly Mutant[];
}
