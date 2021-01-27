import { Range } from './range';
import { Location } from './location';

/**
 * Represents a mutant
 */
export interface Mutant {
  /**
   * The id of the mutant. Unique within a run.
   */
  id: number;
  /**
   * The name of the mutator that generated this mutant.
   */
  mutatorName: string;
  /**
   * The file name from which this mutant originated
   */
  fileName: string;
  /**
   * The range of this mutant (from/to within the file)
   */
  range: Range;
  /**
   * The line number/column location of this mutant
   */
  location: Location;
  /**
   * The replacement (actual mutated code)
   */
  replacement: string;
  /**
   * If the mutant was ignored during generation, the reason for ignoring it, otherwise `undefined`
   */
  ignoreReason?: string;
}
