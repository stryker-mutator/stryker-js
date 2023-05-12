// Stryker disable all
import { Suite, Test } from 'vitest';

export function toTestId(test: Test): string {
  function collectTestName({ name, suite }: { name: string; suite?: Suite }): string {
    const nameParts = [name];
    let currentSuite = suite;
    while (currentSuite) {
      nameParts.unshift(currentSuite.name);
      currentSuite = currentSuite.suite;
    }
    return nameParts.join(' ').trim();
  }
  return `${test.file?.name}#${collectTestName(test)}`;
}
