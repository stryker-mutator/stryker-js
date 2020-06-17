import { File, Mutant } from '../../core';

export default interface Mutator {
  mutate(inputFiles: readonly File[]): readonly Mutant[];
}
