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
            covered = this.mutantCoversFile(mutant, coveredFile);
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

  private mutantCoversFile(mutant: Mutant, coveredFile: CoverageResult): boolean {
    let smallestStatementFound = "";
    let smallestStatementLocation: Location;

    Object.keys(coveredFile.statementMap).forEach(statementId => {
      let location = coveredFile.statementMap[parseInt(statementId)];

      if (this.mutantCoversLocation(mutant, location) && this.isNewSmallestStatement(smallestStatementLocation, location)) {
        smallestStatementFound = statementId;
        smallestStatementLocation = location;
      }
    });

    return smallestStatementFound.length > 0 && coveredFile.s[smallestStatementFound] !== 0;
  }

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

  private mutantCoversLocation(mutant: Mutant, location: Location): boolean {
    let mutantIsAfterStart = mutant.lineNumber > location.start.line ||
      (mutant.lineNumber === location.start.line && mutant.columnNumber >= location.start.column);
    let mutantIsBeforeEnd = mutant.lineNumber < location.end.line ||
      (mutant.lineNumber === location.end.line && mutant.columnNumber <= location.end.column);

    return mutantIsAfterStart && mutantIsBeforeEnd;
  }
}