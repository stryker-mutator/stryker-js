import type { RunnerTestCase, RunnerTestSuite } from 'vitest';

// Don't merge this file into 'vitest-helpers.ts'!
// This file is used from the testing environment (via stryker-setup.js) and thus could be loaded into the browser (when using vitest with browser mode).
// Thus we should avoid unnecessary dependencies in this file.

/**
 * The separator Vitest itself uses between the suite chain and the test name.
 * Vitest 5 matches `testNamePattern` against the full chain joined with `' > '`;
 * before that it was a plain space.
 * @see https://vitest.dev/guide/migration/
 */
export const VITEST_5_TEST_NAME_SEPARATOR = ' > ';
export const LEGACY_TEST_NAME_SEPARATOR = ' ';

export function collectTestName(
  {
    name,
    suite,
  }: {
    name: string;
    suite?: RunnerTestSuite;
  },
  separator: string = LEGACY_TEST_NAME_SEPARATOR,
): string {
  const nameParts = [name];
  let currentSuite = suite;
  while (currentSuite) {
    nameParts.unshift(currentSuite.name);
    currentSuite = currentSuite.suite;
  }
  return nameParts.join(separator).trim();
}

export function toRawTestId(
  test: RunnerTestCase,
  separator: string = LEGACY_TEST_NAME_SEPARATOR,
): string {
  return `${test.file?.filepath ?? 'unknown.js'}#${collectTestName(test, separator)}`;
}
