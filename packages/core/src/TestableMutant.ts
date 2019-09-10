import { Location } from '@stryker-mutator/api/core';
import { Mutant } from '@stryker-mutator/api/mutant';
import { MutantResult, MutantStatus } from '@stryker-mutator/api/report';
import { TestSelection } from '@stryker-mutator/api/test_framework';
import { RunResult, TestResult } from '@stryker-mutator/api/test_runner';
import SourceFile, { isLineBreak } from './SourceFile';
import { freezeRecursively } from './utils/objectUtils';

export enum TestSelectionResult {
  Failed,
  FailedButAlreadyReported,
  Success
}

export default class TestableMutant {

  private readonly _selectedTests: TestSelection[] = [];
  public specsRan: string[] = [];
  private _timeSpentScopedTests = 0;
  private _location: Location;
  public testSelectionResult = TestSelectionResult.Success;

  get selectedTests(): TestSelection[] {
    return this._selectedTests;
  }

  get timeSpentScopedTests() {
    return this._timeSpentScopedTests;
  }

  get fileName() {
    return this.mutant.fileName;
  }

  get mutatorName() {
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

  public selectAllTests(runResult: RunResult, testSelectionResult: TestSelectionResult) {
    this.testSelectionResult = testSelectionResult;
    runResult.tests.forEach((testResult, id) => this.selectTest(testResult, id));
  }

  public selectTest(testResult: TestResult, index: number) {
    this._selectedTests.push({ id: index, name: testResult.name });
    this._timeSpentScopedTests += testResult.timeSpentMs;
  }

  constructor(public readonly id: string, public mutant: Mutant, public sourceFile: SourceFile) {
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
    let startIndexLines = this.mutant.range[0];
    let endIndexLines = this.mutant.range[1];
    while (startIndexLines > 0 && !isLineBreak(this.originalCode.charCodeAt(startIndexLines - 1))) {
      startIndexLines--;
    }
    while (endIndexLines < this.sourceFile.content.length && !isLineBreak(this.originalCode.charCodeAt(endIndexLines))) {
      endIndexLines++;
    }
    return [startIndexLines, endIndexLines];
  }

  public result(status: MutantStatus, testsRan: string[]): MutantResult {
    return freezeRecursively({
      id: this.id,
      location: this.location,
      mutatedLines: this.mutatedLines,
      mutatorName: this.mutatorName,
      originalLines: this.originalLines,
      range: this.range,
      replacement: this.replacement,
      sourceFilePath: this.fileName,
      status,
      testsRan
    });
  }

  public toString() {
    return `${this.mutant.mutatorName}: (${this.replacement}) file://${this.fileName}:${this.location.start.line + 1}:${this.location.start.column}`;
  }
}
