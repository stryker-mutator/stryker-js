/**
 * Represents a score result of a file or directory
 */
interface ScoreResult {

  /**
   * The file or directory name of this score result node
   */
  readonly name: string;
  
  /**
   * Any child directory/file score result nodes
   * If this score result represents a file, the length will be 0
   */
  readonly childResults: ReadonlyArray<ScoreResult>;

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
   * The total number of mutants that caused an error.
   * These didn't effect the mutation score, as they are treated as false positives.
   */
  readonly errors: number;
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
   * The total number of mutants.
   * Excluding any mutants that caused an error as they are treated as false positives.
   * `killed + timed out + survived + no coverage`
   */
  readonly totalMutants: number;
  /**
   * The total number of mutants tested in an area that had code coverage result
   * `killed + timed out + survived`
   */
  readonly totalCovered: number;
  /**
   * The total percentage of mutants that were killed.
   * `totalDetected / totalMutants * 100`,
   */
  readonly mutationScore: number;
  /**
   * The total percentage of mutants that were killed based on the code coverage results of the initial test run.
   * `totalDetected / totalCovered * 100`
   */
  readonly mutationScoreBasedOnCoveredCode: number;
}

export default ScoreResult;