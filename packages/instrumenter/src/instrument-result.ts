import { File, Mutant } from '@stryker-mutator/api/core';

export interface InstrumentResult {
  files: readonly File[];
  mutants: readonly Mutant[];
}
