import path from 'path';

import {
  BaseTestResult,
  TestResult,
  TestStatus,
} from '@stryker-mutator/api/test-runner';
import type { RunMode, TaskState } from 'vitest';
import { RunnerTestCase, RunnerTestSuite } from 'vitest/node';
import { MutantCoverage } from '@stryker-mutator/api/core';
import { collectTestName, toRawTestId } from './test-helpers.js';

function convertTaskStateToTestStatus(
  taskState: TaskState | undefined,
  testMode: RunMode,
): TestStatus {
  if (testMode === 'skip') {
    return TestStatus.Skipped;
  }
  switch (taskState) {
    case 'pass':
      return TestStatus.Success;
    case 'fail':
      return TestStatus.Failed;
    case 'skip':
    case 'todo':
      return TestStatus.Skipped;
    default: // taskState is undefined | "run" | "only". This should not happen
  }
  return TestStatus.Failed;
}

export function convertTestToTestResult(test: RunnerTestCase): TestResult {
  const status = convertTaskStateToTestStatus(test.result?.state, test.mode);
  const baseTestResult: BaseTestResult = {
    id: normalizeTestId(toRawTestId(test)),
    name: collectTestName(test),
    timeSpentMs: test.result?.duration ?? 0,
    fileName: test.file?.filepath && path.resolve(test.file.filepath),
  };
  if (status === TestStatus.Failed) {
    return {
      ...baseTestResult,
      status,
      failureMessage:
        test.result?.errors?.[0]?.message ?? 'StrykerJS: Unknown test failure',
    };
  } else {
    return {
      ...baseTestResult,
      status,
    };
  }
}

export function fromTestId(id: string): { file: string; test: string } {
  const [file, ...name] = id.split('#');
  return { file, test: name.join('#') };
}

export function normalizeTestId(id: string): string {
  const { file, test } = fromTestId(id);
  return `${path.relative(process.cwd(), file).replace(/\\/g, '/')}#${test}`;
}

export function normalizeCoverage(rawCoverage: MutantCoverage): MutantCoverage {
  return {
    perTest: Object.fromEntries(
      Object.entries(rawCoverage.perTest).map(
        ([rawTestId, coverageData]) =>
          [normalizeTestId(rawTestId), coverageData] as const,
      ),
    ),
    static: rawCoverage.static,
  };
}

export function collectTestsFromSuite(
  suite: RunnerTestSuite,
): RunnerTestCase[] {
  return suite.tasks.flatMap((task) => {
    if (task.type === 'suite') {
      return collectTestsFromSuite(task);
    } else if (task.type === 'test') {
      return task;
    } else {
      return [];
    }
  });
}

export function isErrorCodeError(
  error: unknown,
): error is Error & { code: string } {
  return (
    error instanceof Error && 'code' in error && typeof error.code === 'string'
  );
}

/** @see https://github.com/vitest-dev/vitest/blob/main/packages/vitest/src/node/errors.ts */
export const VITEST_ERROR_CODES = Object.freeze({
  FILES_NOT_FOUND: 'VITEST_FILES_NOT_FOUND',
});
