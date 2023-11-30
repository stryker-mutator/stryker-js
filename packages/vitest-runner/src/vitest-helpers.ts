import path from 'path';

import { BaseTestResult, TestResult, TestStatus } from '@stryker-mutator/api/test-runner';
import type { RunMode, Suite, TaskState, Test, ResolvedConfig } from 'vitest';
import { MutantCoverage } from '@stryker-mutator/api/core';

function convertTaskStateToTestStatus(taskState: TaskState | undefined, testMode: RunMode): TestStatus {
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

export function convertTestToTestResult(test: Test): TestResult {
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
      failureMessage: test.result?.errors?.[0]?.message ?? 'StrykerJS: Unknown test failure',
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
      Object.entries(rawCoverage.perTest).map(([rawTestId, coverageData]) => [normalizeTestId(rawTestId), coverageData] as const),
    ),
    static: rawCoverage.static,
  };
}

export function collectTestsFromSuite(suite: Suite): Test[] {
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

export function addToInlineDeps(config: ResolvedConfig, matcher: RegExp): void {
  switch (typeof config.deps?.inline) {
    case 'undefined':
      config.deps = { inline: [matcher] };
      break;
    case 'object':
      config.deps.inline.push(matcher);
      break;
    case 'boolean':
      if (!config.deps.inline) {
        config.deps.inline = [matcher];
      }
      break;
    default:
      config.deps.inline satisfies never;
  }
}

// Stryker disable all: the function toTestId will be stringified at runtime which will cause problems when mutated.

// Note: this function is used in code and copied to the mutated environment so the naming convention will always be the same.
// It can not use external resource because those will not be available in the mutated environment.
export function collectTestName({ name, suite }: { name: string; suite?: Suite }): string {
  const nameParts = [name];
  let currentSuite = suite;
  while (currentSuite) {
    nameParts.unshift(currentSuite.name);
    currentSuite = currentSuite.suite;
  }
  return nameParts.join(' ').trim();
}

export function toRawTestId(test: Test): string {
  return `${test.file?.filepath ?? 'unknown.js'}#${collectTestName(test)}`;
}
// Stryker restore all
