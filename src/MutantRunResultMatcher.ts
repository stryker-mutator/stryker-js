import Mutant from './Mutant';
import { RunResult, CoverageResult } from 'stryker-api/test_runner';
import { Location } from 'stryker-api/core';

export default class MutantRunResultMatcher {

  constructor(private mutants: Mutant[], private runResultsByTestId: RunResult[]) { }

  matchWithMutants() {
    this.mutants.forEach(mutant => {
      let smallestStatement: string;
      this.runResultsByTestId.forEach((testResult, id) => {
        let covered = false;
        if (testResult.coverage) {
          let coveredFile = testResult.coverage[mutant.filename];
          if (coveredFile) {
            // Statement map should change between test run results.
            // We should be able to safely reuse the smallest statement found in first run.
            if (!smallestStatement) {
              smallestStatement = this.findSmallestCoveringStatement(mutant, coveredFile);
            }
            covered = coveredFile.s[smallestStatement] > 0;
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
   * Finds the smallest statement that covers a mutant.
   * @param mutant The mutant.
   * @param coveredFile The CoverageResult.
   * @returns The index of the coveredFile which contains the smallest statement surrounding the mutant.
   */
  private findSmallestCoveringStatement(mutant: Mutant, coveredFile: CoverageResult): string {
    let smallestStatement: string;

    Object.keys(coveredFile.statementMap).forEach(statementId => {
      let location = coveredFile.statementMap[statementId];

      if (this.statementCoversMutant(mutant, location) && this.isNewSmallestStatement(coveredFile.statementMap[smallestStatement], location)) {
        smallestStatement = statementId;
      }
    });

    return smallestStatement;
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
    let mutantIsAfterStart = mutant.location.start.line > location.start.line ||
      (mutant.location.start.line === location.start.line && mutant.location.start.column >= location.start.column);
    let mutantIsBeforeEnd = mutant.location.end.line < location.end.line ||
      (mutant.location.end.line === location.end.line && mutant.location.end.column <= location.end.column);
      
    return mutantIsAfterStart && mutantIsBeforeEnd;
  }
}