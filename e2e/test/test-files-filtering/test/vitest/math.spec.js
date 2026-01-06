import { expect, test } from 'vitest';
import { add } from '../../src/math.js';

test('add should sum correctly', () => {
  expect(add(1, 2)).toBe(3);
});
