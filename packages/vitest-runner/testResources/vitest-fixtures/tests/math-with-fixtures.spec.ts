import { describe, expect } from 'vitest';
import { test } from './fixtures.js';

// Tests using Vitest fixtures (test.extend) - Vitest requires hooks like beforeEach
// to use object destructuring when fixtures are in use, e.g. ({ task }) => {} instead of (test) => {}
describe('math with fixtures', () => {
  test('should be able to add two numbers using fixture', ({ calculator }) => {
    const result = calculator.add(2, 3);
    expect(result).toBe(5);
  });

  test('should be able to add negative numbers using fixture', ({ calculator }) => {
    const result = calculator.add(-1, 1);
    expect(result).toBe(0);
  });
});
