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
  TimeoutMutantRunResult,
} from '@stryker-mutator/api/test-runner';
import { CheckResult, FailedCheckResult, CheckStatus } from '@stryker-mutator/api/check';

/**
 * Simple file interface, since we cannot use the File class directly because that would result in a dependency cycle
 */
interface File {
  name: string;
  textContent: string;
}

export function expectKilled(result: MutantRunResult): asserts result is KilledMutantRunResult {
  assert.strictEqual(result.status, MutantRunStatus.Killed, result.status === MutantRunStatus.Error ? result.errorMessage : '');
}

export function expectTimeout(result: MutantRunResult): asserts result is TimeoutMutantRunResult {
  assert.strictEqual(result.status, MutantRunStatus.Timeout);
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

/**
 * Compares test results while trimming failure messages to their first line (no stack traces)
 */
export function expectTestResults(actual: DryRunResult, expectedTestResults: Array<Partial<TestResult>>): void {
  expectCompleted(actual);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const actualPruned = pruneUnexpected(actual.tests, expectedTestResults as any);
  actualPruned.forEach((test) => {
    if (test.status === TestStatus.Failed && test.failureMessage) {
      test.failureMessage = test.failureMessage.substr(0, test.failureMessage.indexOf('\n'));
    }
  });
  expect(actualPruned).deep.eq(expectedTestResults);
}

/**
 * Recursively prune unexpected values from an actual result. This will allow for a much cleaner chai diffing experience.
 * Will not mutate any given input, instead build a new output.
 * @param actual Some actual result you want to prune
 * @param expected Some expected result you want to match to
 * @returns A new `actual` object with all unexpected values pruned.
 */
export function pruneUnexpected<T>(actual: T, expected: Partial<T>): T extends Array<infer U> ? Array<Partial<U>> : Partial<T> {
  if (actual !== null && typeof actual === 'object') {
    if (Array.isArray(actual) && Array.isArray(expected)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      return actual.map((actualItem, index) => pruneUnexpected(actualItem, expected[index])) as unknown as T extends Array<infer U>
        ? Array<Partial<U>>
        : Partial<T>;
    }
    if (expected) {
      return Object.keys(expected).reduce<Partial<T>>((acc, key) => {
        const actualValue = actual[key as keyof T];
        if (actualValue !== undefined) {
          acc[key as keyof T] = actualValue;
        }
        return acc;
      }, {}) as T extends Array<infer U> ? Array<Partial<U>> : Partial<T>;
    } else {
      return actual as unknown as T extends Array<infer U> ? Array<Partial<U>> : Partial<T>;
    }
  }
  return actual as unknown as T extends Array<infer U> ? Array<Partial<U>> : Partial<T>;
}
