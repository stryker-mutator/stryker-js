import { describe, it, expect } from 'vitest';
// Using @fast-check/vitest plugin instead of fast-check directly is crucial for this test.
// The plugin registers itself globally on the Vitest instance, which reproduces the
// "dual instance" problem described in https://github.com/stryker-mutator/stryker-js/issues/5714
// - Without the fix: Stryker loads its bundled Vitest, the plugin registers on the project's
//   Vitest instance → two separate instances → plugin doesn't work → NO TESTS FOUND (Stryker crashes)
// - With the fix: Stryker loads the project's local Vitest instance → single instance →
//   plugin works correctly → tests run and mutants are killed
import { test } from '@fast-check/vitest';
import { fc } from '@fast-check/vitest';
import { add, isPositive } from '../src/math';

describe('math', () => {
  describe('add', () => {
    it('should return correct sum for concrete values', () => {
      expect(add(2, 3)).toBe(5);
      expect(add(-1, 1)).toBe(0);
      expect(add(0, 0)).toBe(0);
    });

    test.prop([fc.integer(), fc.integer()])('should be commutative', (a, b) => {
      expect(add(a, b)).toBe(add(b, a));
    });

    test.prop([fc.integer()])('should have 0 as identity', (a) => {
      expect(add(a, 0)).toBe(a);
    });

    test.prop([fc.integer(), fc.integer()])('should return correct sum', (a, b) => {
      expect(add(a, b)).toBe(a + b);
    });
  });

  describe('isPositive', () => {
    it('should return correct values for concrete inputs', () => {
      expect(isPositive(1)).toBe(true);
      expect(isPositive(0)).toBe(false);
      expect(isPositive(-1)).toBe(false);
    });

    test.prop([fc.integer({ min: 1 })])('should return true for positive numbers', (n) => {
      expect(isPositive(n)).toBe(true);
    });

    test.prop([fc.integer({ max: 0 })])('should return false for zero and negative numbers', (n) => {
      expect(isPositive(n)).toBe(false);
    });
  });
});
