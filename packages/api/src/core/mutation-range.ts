import { Position } from './position.js';

/**
 * Represents a range of mutants that the instrumenter should instrument
 */
export interface MutationRange {
  /**
   * The start of the range to instrument, by line and column number, inclusive
   */
  start: Position;

  /**
   * The end of the range to instrument, by line and number, inclusive
   */
  end: Position;
}
