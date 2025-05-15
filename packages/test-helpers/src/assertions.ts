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
import {
  CheckResult,
  FailedCheckResult,
  CheckStatus,
} from '@stryker-mutator/api/check';

/**
 * Simple file interface, since we cannot use the File class directly because that would result in a dependency cycle
 */
interface File {
  name: string;
  content: string;
}

export function expectKilled(
  result: MutantRunResult,
): asserts result is KilledMutantRunResult {
  assert.strictEqual(
    result.status,
    MutantRunStatus.Killed,
    result.status === MutantRunStatus.Error ? result.errorMessage : '',
  );
}

export function expectTimeout(
  result: MutantRunResult,
): asserts result is TimeoutMutantRunResult {
  assert.strictEqual(result.status, MutantRunStatus.Timeout);
}

export function expectFailed(
  result: TestResult,
): asserts result is FailedTestResult {
  assert.strictEqual(result.status, TestStatus.Failed);
}

export function expectCompleted(
  runResult: DryRunResult,
): asserts runResult is CompleteDryRunResult {
  assert.strictEqual(
    runResult.status,
    DryRunStatus.Complete,
    runResult.status === DryRunStatus.Error
      ? runResult.errorMessage
      : 'Timeout occurred',
  );
}

export function expectCompileError(
  checkResult: CheckResult,
): asserts checkResult is FailedCheckResult {
  assert.strictEqual(checkResult.status, CheckStatus.CompileError);
}

export function expectErrored(
  runResult: MutantRunResult,
): asserts runResult is ErrorMutantRunResult;
export function expectErrored(
  runResult: DryRunResult,
): asserts runResult is ErrorDryRunResult;
export function expectErrored(
  runResult: DryRunResult | MutantRunResult,
): asserts runResult is ErrorDryRunResult | MutantRunResult;
export function expectErrored(runResult: DryRunResult | MutantRunResult): void {
  assert.strictEqual(runResult.status, DryRunStatus.Error);
}
export function expectSurvived(
  runResult: MutantRunResult,
): asserts runResult is SurvivedMutantRunResult {
  assert.strictEqual(
    runResult.status,
    MutantRunStatus.Survived,
    runResult.status === MutantRunStatus.Error ? runResult.errorMessage : '',
  );
}

export function expectTextFileEqual(actual: File, expected: File): void {
  expect(fileToJson(actual)).deep.eq(fileToJson(expected));
}

export function expectTextFilesEqual(
  actual: readonly File[],
  expected: readonly File[],
): void {
  expect(actual.map(fileToJson)).deep.eq(expected.map(fileToJson));
}

function fileToJson(file: File) {
  return {
    name: file.name,
    content: file.content,
  };
}

type PartialTestResult = Partial<TestResult> & Pick<TestResult, 'id'>;

/**
 * Compares test results while trimming failure messages to their first line (no stack traces)
 */
export function expectTestResults(
  actual: DryRunResult,
  expectedTestResults: PartialTestResult[],
): void {
  expectCompleted(actual);

  const actualPruned = pruneUnexpected(
    actual.tests,
    expectedTestResults as any,
  );
  actualPruned.forEach((test) => {
    if (test.status === TestStatus.Failed && test.failureMessage) {
      test.failureMessage = test.failureMessage.substring(
        0,
        test.failureMessage.indexOf('\n'),
      );
    }
  });
  actualPruned.sort((a, b) => a.id.localeCompare(b.id));
  expectedTestResults.sort((a, b) => a.id.localeCompare(b.id));
  expect(actualPruned).deep.eq(expectedTestResults);
}

/**
 * Recursively prune unexpected values from an actual result. This will allow for a much cleaner chai diffing experience.
 * Will not mutate any given input, instead build a new output.
 * @param actual Some actual result you want to prune
 * @param expected Some expected result you want to match to
 * @returns A new `actual` object with all unexpected values pruned.
 */
function pruneUnexpected(
  actual: TestResult[],
  expected: PartialTestResult[],
): PartialTestResult[] {
  return actual.map(({ id, ...actualTestData }) => {
    const expectedTest = expected.find((test) => test.id === id);
    if (expectedTest) {
      return {
        id,
        ...Object.keys(expectedTest).reduce<Partial<TestResult>>((acc, key) => {
          const prop = key as keyof TestResult;
          if (prop !== 'id') {
            (acc as any)[prop] = actualTestData[prop];
          }
          return acc;
        }, {}),
      };
    } else {
      // Test will fail, because expected does not exist,
      // but we still want to see the actual result in the diff
      return {
        id,
        ...actualTestData,
      };
    }
  });
}
