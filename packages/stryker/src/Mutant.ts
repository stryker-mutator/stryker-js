import { Location, Range } from 'stryker-api/core';
import StrykerTempFolder from './utils/StrykerTempFolder';
import { TestResult, RunResult } from 'stryker-api/test_runner';

/**
 * Represents a mutation which has been applied to a file.
 */
export default class Mutant {

  private _scopedTestIds: number[] = [];
  public specsRan: string[] = [];
  private _timeSpentScopedTests = 0;

  get scopedTestIds(): number[] {
    return this._scopedTestIds;
  }

  get timeSpentScopedTests() {
    return this._timeSpentScopedTests;
  }

  public addAllTestResults(runResult: RunResult) {
    runResult.tests.forEach((testResult, id) => this.addTestResult(id, testResult));
  }

  public addTestResult(index: number, testResult: TestResult) {
    this._scopedTestIds.push(index);
    this._timeSpentScopedTests += testResult.timeSpentMs;
  }

  /**
   * @param mutatorName - The name of the Mutator which created this mutant.
   * @param filename - The name of the file which was mutated, including the path.
   * @param originalCode - The original content of the file which has not been mutated.
   * @param replacement - The mutated code which will replace a part of the originalCode.
   * @param location - The location of the code to be mutated - line and column based
   * @param range - The location of the code to be mutated - index based
   */
  constructor(public mutatorName: string, public filename: string, private originalCode: string, public replacement: string, public location: Location, public range: Range) {
  }

  private isNewLine(index: number) {
    let char = this.originalCode[index];
    return char === '\n' || char === '\r';
  }

  private getMutationLineIndexes() {
    let startIndexLines = this.range[0],
      endIndexLines = this.range[1];
    while (startIndexLines > 0 && !this.isNewLine(startIndexLines - 1)) {
      startIndexLines--;
    }
    while (endIndexLines < this.originalCode.length && !this.isNewLine(endIndexLines)) {
      endIndexLines++;
    }
    return [startIndexLines, endIndexLines];
  }

  public get originalLines() {
    let [startIndex, endIndex] = this.getMutationLineIndexes();
    return this.originalCode.substring(startIndex, endIndex);
  }

  public get mutatedLines() {
    let [startIndex, endIndex] = this.getMutationLineIndexes();
    return this.originalCode.substring(startIndex, this.range[0]) + this.replacement + this.originalCode.substring(this.range[1], endIndex);
  }

  private get mutatedCode() {
    return this.originalCode.substr(0, this.range[0]) + this.replacement + this.originalCode.substr(this.range[1]);
  }

  /**
   * Saves the mutated code in a mutated file.
   * @function
   */
  save(filename: string) {
    return StrykerTempFolder.writeFile(filename, this.mutatedCode);
  }

  /**
   * Removes the mutated file.
   * @function
   */
  reset(filename: string) {
    return StrykerTempFolder.writeFile(filename, this.originalCode);
  }

  toString() {
    return `${this.mutatorName} (${this.filename}@${this.location.start.line}:${this.location.start.column})`;
  }
}