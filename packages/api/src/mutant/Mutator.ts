import { File } from '../../core';
import Mutant from './Mutant';

export default interface Mutator {
  mutate(inputFiles: readonly File[]): readonly Mutant[];
}
