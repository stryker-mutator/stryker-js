import { File } from '../../core';
import Mutant from './Mutant';

export default interface Mutator {
  generateMutants(inputFiles: File[]): Mutant[];
}