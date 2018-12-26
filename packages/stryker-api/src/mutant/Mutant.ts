import { Range } from '../../core';

interface Mutant {
  fileName: string;
  mutatorName: string;
  range: Range;
  replacement: string;
}

export default Mutant;
