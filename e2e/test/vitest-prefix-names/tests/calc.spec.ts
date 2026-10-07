import { describe, expect, it } from 'vitest';

import { add, negate } from '../src/math';

describe('calc', () => {
  // A weak test: the `a + b` -> `a - b` mutant survives it
  it('add', () => {
    expect(add(0, 0)).toBe(0);
  });

  // The name starts with the name of the test above, but it does not cover `add`
  it('add negative', () => {
    expect(negate(2)).toBe(-2);
  });
});
