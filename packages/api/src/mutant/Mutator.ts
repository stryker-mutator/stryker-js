import { File } from '../../core';
import Mutant from './Mutant';
import { ParserPlugin } from '@babel/parser';

export default interface Mutator {
  mutate(inputFiles: ReadonlyArray<File>, options?: ParserPlugin[]): ReadonlyArray<Mutant>;
}
