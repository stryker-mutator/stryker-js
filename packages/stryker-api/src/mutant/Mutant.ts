import { Range } from '../../core';

interface Mutant {
  mutatorName: string;
  replacementSourceCode: string;
  replacementJavascriptCode: string;
  fileName: string;
  range: Range;
}

export default Mutant;