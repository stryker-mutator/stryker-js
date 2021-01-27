export interface MatchedMutant {
  /**
   * The ID of the mutant
   */
  readonly id: string;
  /**
   * The Mutator name
   */
  readonly mutatorName: string;
  /**
   * Whether or not all tests will run for this mutant
   */
  readonly runAllTests: boolean;
  /**
   * If not all tests will run for this mutant, this array will contain the ids of the tests that will run.
   */
  readonly testFilter: string[] | undefined;
  /**
   * The time spent on the tests that will run in initial test run
   */
  readonly timeSpentScopedTests: number;
  /**
   * The file name that contains the mutant
   */
  readonly fileName: string;
  /**
   * The replacement code to be inserted
   */
  readonly replacement: string;
}
