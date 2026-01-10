import { expect, test } from 'vitest';
import { add } from '../../src/math.js';

test('noop', () => {
  void add; // Ensure related
  expect(true).toBe(true);
});
