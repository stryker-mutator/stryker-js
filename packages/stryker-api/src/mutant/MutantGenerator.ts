import { File } from '../../core';
import Mutant from './Mutant';

export default interface MutantGenerator {
  generateMutants(inputFiles: File[]): Mutant[];
}