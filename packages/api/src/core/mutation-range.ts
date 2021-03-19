/**
 * Represents a range of mutants that the instrumenter should instrument
 */
export interface MutationRange {
  /**
   * The filename of the file that this range belongs to
   */
  fileName: string;

  /**
   * The start of the range to instrument, by line and column number, inclusive
   */
  start: {
    line: number;
    column: number;
  };

  /**
   * The end of the range to instrument, by line and number, inclusive
   */
  end: {
    line: number;
    column: number;
  };
}
