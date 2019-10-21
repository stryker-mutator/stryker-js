/**
 * Represents a score result of a file or directory
 */
interface ScoreResult {
  /**
   * The file or directory name of this score result node
   */
  readonly name: string;

  /**
   * Full path to file or directory of this score result node
   */
  readonly path: string;

  /**
   * True if this score result represents a file, false if it represents a directory
   */
  readonly representsFile: boolean;

  /**
   * Any child directory/file score result nodes
   * If this score result represents a file, the length will be 0
   */
  readonly childResults: readonly ScoreResult[];

  /**
   * The total number of mutants that were killed
   */
  readonly killed: number;
  /**
   * The total number of mutants that timed out
   */
  readonly timedOut: number;
  /**
   * The total number of mutants that were tested but survived
   */
  readonly survived: number;
  /**
   * The total number of mutants that were not even tested because they were not covered by any tests.
   */
  readonly noCoverage: number;
  /**
   * The total number of mutants that caused an error during testing.
   * These didn't effect the mutation score, as they are treated as false positives.
   */
  readonly runtimeErrors: number;
  /**
   * The total number of mutants that caused an error during transpiling.
   * These didn't effect the mutation score. as they are treated as false positives.
   */
  readonly transpileErrors: number;
  /**
   * The total number of mutants that were detected, meaning either killed or caused a time out.
   * `killed + timed out`
   */
  readonly totalDetected: number;
  /**
   * The total number of mutants that were undetected, so either survived or were not covered by any code
   * `survived + no coverage`
   */
  readonly totalUndetected: number;
  /**
   * The total number of invalid mutants.
   * `runtimeErrors + transpileErrors`
   */
  readonly totalInvalid: number;
  /**
   * Total number of valid mutants.
   * `totalDetected + totalUndetected`
   */
  readonly totalValid: number;
  /**
   * The total number of mutants.
   * `totalInvalid + totalValid`
   */
  readonly totalMutants: number;
  /**
   * The total number of mutants tested in an area that had code coverage result
   * `totalDetected + survived`
   */
  readonly totalCovered: number;
  /**
   * The total percentage of mutants that were killed.
   * `totalDetected / totalValid * 100`,
   */
  readonly mutationScore: number;
  /**
   * The total percentage of mutants that were killed based on the code coverage results of the initial test run.
   * `totalDetected / totalCovered * 100`
   */
  readonly mutationScoreBasedOnCoveredCode: number;
}

export default ScoreResult;
