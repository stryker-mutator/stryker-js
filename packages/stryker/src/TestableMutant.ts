import { Location } from 'stryker-api/core';
import { RunResult, TestResult } from 'stryker-api/test_runner';
import { Mutant } from 'stryker-api/mutant';
import SourceFile, { isLineBreak } from './SourceFile';


export default class TestableMutant {

  private _scopedTestIds: number[] = [];
  public specsRan: string[] = [];
  private _timeSpentScopedTests = 0;
  private _location: Location;

  get scopedTestIds(): number[] {
    return this._scopedTestIds;
  }

  get timeSpentScopedTests() {
    return this._timeSpentScopedTests;
  }

  get fileName() {
    return this.mutant.fileName;
  }

  get mutatorName(){
    return this.mutant.mutatorName;
  }

  get range() {
    return this.mutant.range;
  }

  get replacement() {
    return this.mutant.replacement;
  }

  get location() {
    if (!this._location) {
      this._location = this.sourceFile.getLocation(this.range);
    }
    return this._location;
  }

  get mutatedCode() {
    return this.sourceFile.content.substr(0, this.range[0]) +
      this.replacement +
      this.sourceFile.content.substr(this.range[1]);
  }

  get originalCode() {
    return this.sourceFile.content;
  }

  public addAllTestResults(runResult: RunResult) {
    runResult.tests.forEach((testResult, id) => this.addTestResult(id, testResult));
  }

  public addTestResult(index: number, testResult: TestResult) {
    this._scopedTestIds.push(index);
    this._timeSpentScopedTests += testResult.timeSpentMs;
  }

  constructor(public mutant: Mutant, private sourceFile: SourceFile) {
  }

  public get originalLines() {
    const [startIndex, endIndex] = this.getMutationLineIndexes();
    return this.sourceFile.content.substring(startIndex, endIndex);
  }

  public get mutatedLines() {
    const [startIndex, endIndex] = this.getMutationLineIndexes();
    return this.sourceFile.content.substring(startIndex, this.mutant.range[0]) + this.mutant.replacement + this.sourceFile.content.substring(this.mutant.range[1], endIndex);
  }

  private getMutationLineIndexes() {
    let startIndexLines = this.mutant.range[0],
      endIndexLines = this.mutant.range[1];
    while (startIndexLines > 0 && !isLineBreak(this.originalCode.charCodeAt(startIndexLines - 1))) {
      startIndexLines--;
    }
    while (endIndexLines < this.sourceFile.content.length && !isLineBreak(this.originalCode.charCodeAt(endIndexLines))) {
      endIndexLines++;
    }
    return [startIndexLines, endIndexLines];
  }

}