enum MutantStatus {
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
   * @example
   * ```javascript
   * const fs = require('f' - 's'); // mutated code
   * ```
   */
  RuntimeError,

  /**
   * The status of a mutant which could not be compiled.
   * @example
   * ```typescript
   * const foo = 'foo' - 'bar'; // mutated code
   * ```
   */
  CompileError,
}

export default MutantStatus;
