import { MatchedMutant, MutantResult, Reporter, ScoreResult, SourceFile } from 'stryker-api/report';

/**
 * Represents a Stryker reporter with all methods implemented
 */
interface StrictReporter extends Reporter {
    onAllMutantsMatchedWithTests(results: ReadonlyArray<MatchedMutant>): void;
    onAllMutantsTested(results: MutantResult[]): void;
    onAllSourceFilesRead(files: SourceFile[]): void;
    onMutantTested(result: MutantResult): void;
    onScoreCalculated(score: ScoreResult): void;
    onSourceFileRead(file: SourceFile): void;
    wrapUp(): void | Promise<void>;
}
export default StrictReporter;
