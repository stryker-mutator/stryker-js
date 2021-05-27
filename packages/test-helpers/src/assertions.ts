import assert from 'assert';

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
} from '@stryker-mutator/api/test-runner';
import { File } from '@stryker-mutator/api/core';
import { CheckResult, FailedCheckResult, CheckStatus } from '@stryker-mutator/api/check';

export function expectKilled(result: MutantRunResult): asserts result is KilledMutantRunResult {
  assert.strictEqual(result.status, MutantRunStatus.Killed, result.status === MutantRunStatus.Error ? result.errorMessage : '');
}

export function expectFailed(result: TestResult): asserts result is FailedTestResult {
  assert.strictEqual(result.status, TestStatus.Failed);
}

export function expectCompleted(runResult: DryRunResult): asserts runResult is CompleteDryRunResult {
  assert.strictEqual(runResult.status, DryRunStatus.Complete, runResult.status === DryRunStatus.Error ? runResult.errorMessage : 'Timeout occurred');
}

export function expectCompileError(checkResult: CheckResult): asserts checkResult is FailedCheckResult {
  assert.strictEqual(checkResult.status, CheckStatus.CompileError);
}

export function expectErrored(runResult: MutantRunResult): asserts runResult is ErrorMutantRunResult;
export function expectErrored(runResult: DryRunResult): asserts runResult is ErrorDryRunResult;
export function expectErrored(runResult: DryRunResult | MutantRunResult): asserts runResult is ErrorDryRunResult | MutantRunResult;
export function expectErrored(runResult: DryRunResult | MutantRunResult): void {
  assert.strictEqual(runResult.status, DryRunStatus.Error);
}
export function expectSurvived(runResult: MutantRunResult): asserts runResult is SurvivedMutantRunResult {
  assert.strictEqual(runResult.status, MutantRunStatus.Survived, runResult.status === MutantRunStatus.Error ? runResult.errorMessage : '');
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
