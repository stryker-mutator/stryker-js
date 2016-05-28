import * as _ from'lodash';
import {Mutator} from './api/mutant';
import {StrykerTempFolder} from './api/util';
import {RunResult} from './api/test_runner';


/**
 * Represents a mutation which has been applied to a file.
 */
export default class Mutant {
  private mutatedCode: string;
  public originalLines: string;
  public mutatedLines: string;

  private scopedTestsById: RunResult[] = [];
  private _scopedTestIds: number[] = [];
  public specsRan: string[] = [];
  private _timeSpentScopedTests = 0;

  get scopedTestIds(): number[] {
    return this._scopedTestIds;
  }

  get timeSpentScopedTests() {
    return this._timeSpentScopedTests;
  }

  public addRunResultForTest(index: number, runResult: RunResult) {
    this._scopedTestIds.push(index);
    this._timeSpentScopedTests += runResult.timeSpent;
    this.scopedTestsById[index] = runResult;
  }

  /**
   * @param mutatorName - The name of the Mutator which created this mutant.
   * @param filename - The name of the file which was mutated, including the path.
   * @param originalCode - The original content of the file which has not been mutated.
   * @param replacement - The mutated code which will replace a part of the originalCode.
   * @param location - The location of the code to be replaced
   */
  constructor(public mutatorName: string, public fileName: string, private originalCode: string, public replacement: string, public location: ESTree.SourceLocation) {
    this.applyMutation();
  }

  /**
   * Inserts the replacement into the mutatedCode based on the specified location.
   * @param substitude - The mutated code which will replace a part of the originalCode
   */
  private applyMutation() {
    let linesOfCode = this.originalCode.split('\n');
    
    this.originalLines = '';
    for (let lineNum = this.location.start.line - 1; lineNum < this.location.end.line; lineNum++) {
      this.originalLines += linesOfCode[lineNum];
      if (lineNum < this.location.end.line - 1) {
        this.originalLines += '\n';
      }
    }
    
    this.mutatedLines = linesOfCode[this.location.start.line - 1].substring(0, this.location.start.column) +
      this.replacement + linesOfCode[this.location.end.line - 1].substring(this.location.end.column);

    for (let lineNum = this.location.start.line; lineNum < this.location.end.line; lineNum++) {
      linesOfCode[lineNum] = '';
    }
    linesOfCode[this.location.start.line - 1] = this.mutatedLines;
    this.mutatedCode = linesOfCode.join('\n');
  }

  /**
   * Saves the mutated code in a mutated file.
   * @function
   */
  save(fileName: string) {
    return StrykerTempFolder.writeFile(fileName, this.mutatedCode);
  };

  /**
   * Removes the mutated file.
   * @function
   */
  reset(fileName: string) {
    return StrykerTempFolder.writeFile(fileName, this.originalCode);
  };
}