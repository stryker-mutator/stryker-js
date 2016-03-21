import Mutant from './Mutant';
import {RunResult, Location, CoverageResult} from './api/test_runner';

export default class MutantRunResultMatcher {

  constructor(private mutants: Mutant[], private runResultsByTestId: RunResult[]) { }

  matchWithMutants() {
    this.mutants.forEach(mutant => {
      this.runResultsByTestId.forEach((testResult, id) => {
        let covered = false;
        if (testResult.coverage) {
          let coveredFile = testResult.coverage[mutant.filename];
          if (coveredFile) {
            covered = this.fileCoversMutant(mutant, coveredFile);
          }
        } else {
          // If there is no coverage result we have to assume the source code is covered
          covered = true;
        }
        if (covered) {
          mutant.addRunResultForTest(id, testResult);
        }
      });
    });
  }

  /**
   * Indicates whether a mutant is covered by a filename.
   * @param mutant The mutant.
   * @param coveredFile The CoverageResult which may or may not cover the mutant.
   * @returns true if the mutant is covered.
   */
  private fileCoversMutant(mutant: Mutant, coveredFile: CoverageResult): boolean {
    let smallestStatementFound = "";
    let smallestStatementLocation: Location;

    Object.keys(coveredFile.statementMap).forEach(statementId => {
      let location = coveredFile.statementMap[parseInt(statementId)];

      if (this.statementCoversMutant(mutant, location) && this.isNewSmallestStatement(smallestStatementLocation, location)) {
        smallestStatementFound = statementId;
        smallestStatementLocation = location;
      }
    });

    return smallestStatementFound.length > 0 && coveredFile.s[smallestStatementFound] !== 0;
  }

  /**
   * Indicates whether a statement is the smallest statement of the two statements provided.
   * @param originalLocation The area which may cover a bigger area than the newLocation.
   * @param newLocation The area which may cover a smaller area than the originalLocation.
   * @returns true if the newLocation covers a smaller area than the originalLocation, making it the smaller statement.
   */
  private isNewSmallestStatement(originalLocation: Location, newLocation: Location): boolean {
    let statementIsSmallestStatement = false;
    if (!originalLocation) {
      statementIsSmallestStatement = true;
    } else {
      let lineDifference = (originalLocation.end.line - originalLocation.start.line) - (newLocation.end.line - newLocation.start.line);
      let coversLessLines = lineDifference > 0;
      let coversLessColumns = lineDifference === 0 && (newLocation.start.column - originalLocation.start.column) + (originalLocation.end.column - newLocation.end.column) > 0;
      if (coversLessLines || coversLessColumns) {
        statementIsSmallestStatement = true;
      }
    }

    return statementIsSmallestStatement;
  }

  /**
   * Indicates whether a statement covers a mutant.
   * @param mutant The mutant.
   * @param location The location which may cover the mutant.
   * @returns true if the statment covers the mutant.
   */
  private statementCoversMutant(mutant: Mutant, location: Location): boolean {
    let mutantIsAfterStart = mutant.lineNumber > location.start.line ||
      (mutant.lineNumber === location.start.line && mutant.columnNumber >= location.start.column);
    let mutantIsBeforeEnd = mutant.lineNumber < location.end.line ||
      (mutant.lineNumber === location.end.line && mutant.columnNumber <= location.end.column);

    return mutantIsAfterStart && mutantIsBeforeEnd;
  }
}