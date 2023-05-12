// Stryker disable all: the function toTestId will be stringified at runtime which will cause problems when mutated.
import { Suite, Test } from 'vitest';

// Note: this function is used in code and copied to the mutated environment so the naming convention will always be the same.
// It can not use external resource because those will not be available in the mutated environment.
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
