import assert = require('assert');

import { expect } from 'chai';

import {
  MutantRunResult,
  SurvivedMutantRunResult,
  ErrorDryRunResult,
  KilledMutantRunResult,
  MutantRunStatus,
  DryRunResult,
  CompleteDryRunResult,
  DryRunStatus,
  ErrorMutantRunResult,
  TestResult,
  FailedTestResult,
  TestStatus,
} from '@stryker-mutator/api/test_runner2';
import { File } from '@stryker-mutator/api/core';
import { CheckResult, FailedCheckResult, CheckStatus } from '@stryker-mutator/api/check';

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

export function expectTextFileEqual(actual: File, expected: File) {
  expect(fileToJson(actual)).deep.eq(fileToJson(expected));
}

export function expectTextFilesEqual(actual: File[], expected: File[]) {
  expect(actual.map(fileToJson)).deep.eq(expected.map(fileToJson));
}

function fileToJson(file: File) {
  return {
    name: file.name,
    textContent: file.textContent,
  };
}
