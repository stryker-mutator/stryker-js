import Mutant from './Mutant';
import {RunResult, Location} from './api/test_runner';
import {CoverageResult} from './api/test_runner/Coverage';

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
    
    Object.keys(coveredFile.statementMap).forEach(statementId => {
      let location = coveredFile.statementMap[parseInt(statementId)];
        
      if(this.mutantCoversLocation(mutant, location)){
        smallestStatementFound = statementId;
      }
    });

    return smallestStatementFound.length > 0 && coveredFile.s[smallestStatementFound] !== 0;
  }

  private mutantCoversLocation(mutant: Mutant, location: Location): boolean {
    let mutantIsAfterStart = mutant.lineNumber > location.start.line ||
      (mutant.lineNumber === location.start.line && mutant.columnNumber >= location.start.column);
    let mutantIsBeforeEnd = mutant.lineNumber < location.end.line ||
      (mutant.lineNumber === location.end.line && mutant.columnNumber <= location.end.column);

    return mutantIsAfterStart && mutantIsBeforeEnd;
  }
}