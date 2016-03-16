import Mutant from './Mutant';
import {RunResult, Location} from './api/test_runner';

export default class MutantRunResultMatcher {

  constructor(private mutants: Mutant[], private testResultsById: RunResult[]) { }

  matchWithMutants() {
    this.mutants.forEach(mutant => {
      this.testResultsById.forEach((testResult, id) => {
        let covered = false;
        if (testResult.coverage) {
          let coveredFile = testResult.coverage[mutant.filename];
          if (coveredFile) {
            covered = coveredFile.statementMap.some((location, statementId) => coveredFile.s[statementId] !== 0 && this.mutantCovers(mutant, location));
          }
        } else {
          // If there is no coverage result we have to assume the source code is covered
          covered = true;
        }
        if(covered){
          mutant.addRunResultForTest(id, testResult);
        }
      });
    });
  }

  private mutantCovers(mutant: Mutant, location: Location): boolean {
    if (mutant.lineNumber > location.start.line && mutant.lineNumber <= location.end.line) {
      return true;
    } else if (mutant.lineNumber >= location.start.line && mutant.lineNumber < location.end.line) {
      return true;
    } else if (mutant.lineNumber === location.start.line && mutant.lineNumber === location.end.line) {
      return mutant.columnNumber >= location.start.column || mutant.columnNumber <= location.end.line;
    }
    return false;
  }
}