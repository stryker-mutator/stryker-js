import { Range } from '../../core';

interface Mutant {
  mutatorName: string;
  fileName: string;
  range: Range;
  replacement: string;
}

export default Mutant;
