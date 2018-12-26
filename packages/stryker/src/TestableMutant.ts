import { Location } from 'stryker-api/core';
import { Mutant } from 'stryker-api/mutant';
import { MutantResult, MutantStatus } from 'stryker-api/report';
import { TestSelection } from 'stryker-api/test_framework';
import { RunResult, TestResult } from 'stryker-api/test_runner';
import SourceFile, { isLineBreak } from './SourceFile';
import { freezeRecursively } from './utils/objectUtils';

export enum TestSelectionResult {
  Failed,
  FailedButAlreadyReported,
  Success
}

export default class TestableMutant {

  public get fileName() {
    return this.mutant.fileName;
  }

  public get location() {
    if (!this._location) {
      this._location = this.sourceFile.getLocation(this.range);
    }

    return this._location;
  }

  public get mutatedCode() {
    return this.sourceFile.content.substr(0, this.range[0]) +
      this.replacement +
      this.sourceFile.content.substr(this.range[1]);
  }

  public get mutatedLines() {
    const [startIndex, endIndex] = this.getMutationLineIndexes();

    return this.sourceFile.content.substring(startIndex, this.mutant.range[0]) + this.mutant.replacement + this.sourceFile.content.substring(this.mutant.range[1], endIndex);
  }

  public get mutatorName() {
    return this.mutant.mutatorName;
  }

  public get originalCode() {
    return this.sourceFile.content;
  }

  public get originalLines() {
    const [startIndex, endIndex] = this.getMutationLineIndexes();

    return this.sourceFile.content.substring(startIndex, endIndex);
  }

  public get range() {
    return this.mutant.range;
  }

  public get replacement() {
    return this.mutant.replacement;
  }

  public get selectedTests(): TestSelection[] {
    return this._selectedTests;
  }

  public get timeSpentScopedTests() {
    return this._timeSpentScopedTests;
  }
  public specsRan: string[] = [];
  public testSelectionResult = TestSelectionResult.Success;
  private _location: Location;

  private readonly _selectedTests: TestSelection[] = [];
  private _timeSpentScopedTests = 0;

  constructor(public readonly id: string, public mutant: Mutant, public sourceFile: SourceFile) {
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

  public selectAllTests(runResult: RunResult, testSelectionResult: TestSelectionResult) {
    this.testSelectionResult = testSelectionResult;
    runResult.tests.forEach((testResult, id) => this.selectTest(testResult, id));
  }

  public selectTest(testResult: TestResult, index: number) {
    this._selectedTests.push({ id: index, name: testResult.name });
    this._timeSpentScopedTests += testResult.timeSpentMs;
  }

  public toString() {
    return `${this.mutant.mutatorName}: (${this.replacement}) file://${this.fileName}:${this.location.start.line + 1}:${this.location.start.column}`;
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
}
