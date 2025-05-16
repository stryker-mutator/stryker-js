import type { RunnerTestCase, RunnerTestSuite } from 'vitest';

// Don't merge this file into 'vitest-helpers.ts'!
// This file is used from the testing environment (via stryker-setup.js) and thus could be loaded into the browser (when using vitest with browser mode).
// Thus we should avoid unnecessary dependencies in this file.

export function collectTestName({
  name,
  suite,
}: {
  name: string;
  suite?: RunnerTestSuite;
}): string {
  const nameParts = [name];
  let currentSuite = suite;
  while (currentSuite) {
    nameParts.unshift(currentSuite.name);
    currentSuite = currentSuite.suite;
  }
  return nameParts.join(' ').trim();
}

export function toRawTestId(test: RunnerTestCase): string {
  return `${test.file?.filepath ?? 'unknown.js'}#${collectTestName(test)}`;
}
