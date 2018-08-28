import { File } from '../../core';
import Mutant from './Mutant';

export default interface Mutator {
  mutate(inputFiles: ReadonlyArray<File>): ReadonlyArray<Mutant>;
}
