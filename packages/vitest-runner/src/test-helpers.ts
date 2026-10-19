import type { RunnerTestCase } from 'vitest';

// Don't merge this file into 'vitest-helpers.ts'!
// This file is used from the testing environment (via stryker-setup.js) and thus could be loaded into the browser (when using vitest with browser mode).
// Thus we should avoid unnecessary dependencies in this file.

export function collectTestName(
  { name, suite, fullTestName }: Pick<
    RunnerTestCase,
    'name' | 'suite' | 'fullTestName'
  >,
  useFullTestName = false,
): string {
  if (useFullTestName) {
    return fullTestName;
  }
  const nameParts = [name];
  let currentSuite = suite;
  while (currentSuite) {
    nameParts.unshift(currentSuite.name);
    currentSuite = currentSuite.suite;
  }
  return nameParts.join(' ').trim();
}

export function toRawTestId(
  test: RunnerTestCase,
  useFullTestName = false,
): string {
  return `${test.file?.filepath ?? 'unknown.js'}#${collectTestName(test, useFullTestName)}`;
}
