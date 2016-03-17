import Mutant from './Mutant';
import {RunResult, Location} from './api/test_runner';

export default class MutantRunResultMatcher {

  constructor(private mutants: Mutant[], private runResultsByTestId: RunResult[]) { }

  matchWithMutants() {
    this.mutants.forEach(mutant => {
      this.runResultsByTestId.forEach((testResult, id) => {
        let covered = false;
        if (testResult.coverage) {
          let coveredFile = testResult.coverage[mutant.filename];
          if (coveredFile) {
            covered = Object.keys(coveredFile.statementMap).some(statementId => coveredFile.s[statementId] !== 0
              && this.mutantCovers(mutant, coveredFile.statementMap[parseInt(statementId)]))
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

  private mutantCovers(mutant: Mutant, location: Location): boolean {

    if (mutant.lineNumber > location.start.line && 
      (mutant.lineNumber < location.end.line || (mutant.lineNumber === location.end.line && mutant.columnNumber <= location.end.column))) {
      return true;
    } else if ((mutant.lineNumber > location.start.line || (mutant.lineNumber === location.start.line && mutant.columnNumber >= location.start.column))
       && mutant.lineNumber < location.end.line) {
      return true;
    } else if (mutant.lineNumber === location.start.line && mutant.lineNumber === location.end.line) {
      return mutant.columnNumber >= location.start.column && mutant.columnNumber <= location.end.column;
    }
    return false;
  }
}