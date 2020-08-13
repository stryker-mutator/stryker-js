export enum MutantStatus {
  /**
   * The status of a survived mutant, because it was not covered by any test.
   */
  NoCoverage,

  /**
   * The status of a killed mutant.
   */
  Killed,

  /**
   * The status of a survived mutant.
   */
  Survived,

  /**
   * The status of a timed out mutant.
   */
  TimedOut,

  /**
   * The status of a mutant of which the tests resulted in a runtime error.
   *
   * For example: the following piece of javascript code will result in a runtime error:
   *
   * ```javascript
   * const fs = require('f' - 's'); // mutated code
   * ```
   *
   * Mutants that result in a runtime error are not taken into account during score calculation.
   */
  RuntimeError,

  /**
   * The status of a mutant which could not be transpiled.
   * For example: the following piece of typescript code will give a TranspileError:
   *
   * ```typescript
   * const a: 5 = 0; // mutated code
   * ```
   *
   * Mutants that result in a TranspileError are not taken into account during score calculation.
   */
  TranspileError,
}
