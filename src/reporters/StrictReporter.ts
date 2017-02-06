import {Reporter, SourceFile, MutantResult, MatchedMutant} from 'stryker-api/report';

/**
 * Represents a Stryker reporter with all methods implemented
 */
interface StrictReporter extends Reporter {
    onSourceFileRead(file: SourceFile): void;
    onAllSourceFilesRead(files: SourceFile[]): void;
    onAllMutantsMatchedWithTests(results: ReadonlyArray<MatchedMutant>): void;
    onMutantTested(result: MutantResult): void;
    onAllMutantsTested(results: MutantResult[]): void;
    wrapUp(): void | Promise<void>;
}
export default StrictReporter;
