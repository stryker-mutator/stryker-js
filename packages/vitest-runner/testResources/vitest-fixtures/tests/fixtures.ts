import { test as base } from 'vitest';

// Custom fixture that provides a calculator context
// See: https://vitest.dev/guide/test-context.html
export const test = base.extend<{ calculator: { add: (a: number, b: number) => number } }>({
  calculator: async ({}, use) => {
    // Setup: create the calculator fixture
    const calculator = {
      add: (a: number, b: number) => math.add(a, b),
    };
    // Provide the fixture to the test
    await use(calculator);
    // Teardown (if needed)
  },
});
