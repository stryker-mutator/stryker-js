import { Location } from '@stryker-mutator/api/core';
import { Mutant } from '@stryker-mutator/api/mutant';
import { MutantResult, MutantStatus } from '@stryker-mutator/api/report';
import { TestSelection } from '@stryker-mutator/api/test_framework';
import { RunResult, TestResult } from '@stryker-mutator/api/test_runner';
import { deepFreeze } from '@stryker-mutator/util';

import SourceFile, { isLineBreak } from './SourceFile';

export enum TestSelectionResult {
  Failed,
  FailedButAlreadyReported,
  Success,
}

class TestFilter {
  public timeSpentScopedTests = 0;
  public runAllTests = false;
  public selectedTests: TestSelection[] = [];

  public selectAllTests(runResult: RunResult) {
    this.timeSpentScopedTests = runResult.tests.reduce((time, test) => time + test.timeSpentMs, this.timeSpentScopedTests);
    this.runAllTests = true;
  }

  public selectTest(testResult: TestResult, index: number) {
    this.selectedTests.push({ id: index, name: testResult.name });
    this.timeSpentScopedTests += testResult.timeSpentMs;
    this.runAllTests = false;
  }
}

export default class TestableMutant {
  public specsRan: string[] = [];
  private readonly filter = new TestFilter();
  private _location: Location;
  public testSelectionResult = TestSelectionResult.Success;

  public get selectedTests(): TestSelection[] {
    return this.filter.selectedTests;
  }

  public get runAllTests(): boolean {
    return this.filter.runAllTests;
  }

  public get timeSpentScopedTests() {
    return this.filter.timeSpentScopedTests;
  }

  public get fileName() {
    return this.mutant.fileName;
  }

  public get mutatorName() {
    return this.mutant.mutatorName;
  }

  public get range() {
    return this.mutant.range;
  }

  public get replacement() {
    return this.mutant.replacement;
  }

  public get location() {
    if (!this._location) {
      this._location = this.sourceFile.getLocation(this.range);
    }
    return this._location;
  }

  public get mutatedCode() {
    return this.sourceFile.content.substr(0, this.range[0]) + this.replacement + this.sourceFile.content.substr(this.range[1]);
  }

  public get originalCode() {
    return this.sourceFile.content;
  }

  public selectAllTests(runResult: RunResult, testSelectionResult: TestSelectionResult) {
    this.filter.selectAllTests(runResult);
    this.testSelectionResult = testSelectionResult;
  }

  public selectTest(testResult: TestResult, index: number) {
    this.filter.selectTest(testResult, index);
  }

  constructor(public readonly id: string, public mutant: Mutant, public sourceFile: SourceFile) {}

  public get originalLines() {
    const [startIndex, endIndex] = this.getMutationLineIndexes();
    return this.sourceFile.content.substring(startIndex, endIndex);
  }

  public get mutatedLines() {
    const [startIndex, endIndex] = this.getMutationLineIndexes();
    return (
      this.sourceFile.content.substring(startIndex, this.mutant.range[0]) +
      this.mutant.replacement +
      this.sourceFile.content.substring(this.mutant.range[1], endIndex)
    );
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

  public createResult(status: MutantStatus, testsRan: string[]): MutantResult {
    return deepFreeze({
      id: this.id,
      location: this.location,
      mutatedLines: this.mutatedLines,
      mutatorName: this.mutatorName,
      originalLines: this.originalLines,
      range: this.range,
      replacement: this.replacement,
      sourceFilePath: this.fileName,
      status,
      testsRan,
    }) as MutantResult;
  }

  public toString() {
    return `${this.mutant.mutatorName}: (${this.replacement}) file://${this.fileName}:${this.location.start.line + 1}:${this.location.start.column}`;
  }
}
