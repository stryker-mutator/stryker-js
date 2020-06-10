import { Range } from '../../core';

interface Mutant {
  id: number;
  mutatorName: string;
  fileName: string;
  range: Range;
  replacement: string;
}

export default Mutant;
