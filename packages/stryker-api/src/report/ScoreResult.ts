
interface ScoreResult {

  readonly name: string;
  readonly childResults: ReadonlyArray<ScoreResult>;

  readonly totalDetected: number;
  readonly totalUndetected: number;
  readonly totalMutants: number;
  readonly totalCovered: number;
  readonly mutationScore: number;
  readonly percentageBasedOnCoveredCode: number;

  readonly killed: number;
  readonly timedOut: number;
  readonly survived: number;
  readonly noCoverage: number;
  readonly errors: number;
}

export default ScoreResult;