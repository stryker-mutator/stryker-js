import { InputFile } from '../../core';
import Mutant from './Mutant';

export default interface MutantGenerator {
  generateMutants(inputFiles: InputFile[]): Mutant[];
}