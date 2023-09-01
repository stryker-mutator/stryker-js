import loop from '../../lib/infinite-loop.js';
import { expect, test, describe } from 'vitest';

test('should be able to break out of an infinite loop with a hit counter', () => {
  let total = 0;
  loop(5, (n) => {
    expect(n).not.toBe(0);
    total += n;
  });
  expect(total).toBe(15);
});
