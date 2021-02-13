import assert from 'assert';

import { CheckResult, CheckStatus, FailedCheckResult } from '@stryker-mutator/api/check';
import { File } from '@stryker-mutator/api/core';
import {
  CompleteDryRunResult,
  DryRunResult,
  DryRunStatus,
  ErrorDryRunResult,
  ErrorMutantRunResult,
  FailedTestResult,
  KilledMutantRunResult,
  MutantRunResult,
  MutantRunStatus,
  SurvivedMutantRunResult,
  TestResult,
  TestStatus,
} from '@stryker-mutator/api/test-runner';
import { expect } from 'chai';

export function expectKilled(result: MutantRunResult): asserts result is KilledMutantRunResult {
  assert.equal(result.status, MutantRunStatus.Killed);
}

export function expectFailed(result: TestResult): asserts result is FailedTestResult {
  assert.equal(result.status, TestStatus.Failed);
}

export function expectCompleted(runResult: DryRunResult): asserts runResult is CompleteDryRunResult {
  assert.equal(runResult.status, DryRunStatus.Complete);
}

export function expectCompileError(checkResult: CheckResult): asserts checkResult is FailedCheckResult {
  assert.equal(checkResult.status, CheckStatus.CompileError);
}

export function expectErrored(runResult: MutantRunResult): asserts runResult is ErrorMutantRunResult;
export function expectErrored(runResult: DryRunResult): asserts runResult is ErrorDryRunResult;
export function expectErrored(runResult: DryRunResult | MutantRunResult): asserts runResult is ErrorDryRunResult | MutantRunResult;
export function expectErrored(runResult: DryRunResult | MutantRunResult): void {
  assert.equal(runResult.status, DryRunStatus.Error);
}
export function expectSurvived(runResult: MutantRunResult): asserts runResult is SurvivedMutantRunResult {
  assert.equal(runResult.status, MutantRunStatus.Survived);
}

export function expectTextFileEqual(actual: File, expected: File): void {
  expect(fileToJson(actual)).deep.eq(fileToJson(expected));
}

export function expectTextFilesEqual(actual: readonly File[], expected: readonly File[]): void {
  expect(actual.map(fileToJson)).deep.eq(expected.map(fileToJson));
}

function fileToJson(file: File) {
  return {
    name: file.name,
    textContent: file.textContent,
  };
}
