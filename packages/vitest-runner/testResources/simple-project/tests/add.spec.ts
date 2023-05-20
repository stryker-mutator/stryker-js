import { expect, it, describe } from 'vitest';
import { add } from '../math';

describe(add.name, () => {
  it('should be able to add two numbers', () => {
    const actual = add(2, 5);

    expect(actual).toBe(7);
  });
});
