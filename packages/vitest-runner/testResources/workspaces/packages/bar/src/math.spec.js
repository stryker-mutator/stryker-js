// @ts-check
import { describe, it, expect } from 'vitest';

describe('add', () => {
  it('should add 40, 2 = 42', () => {
    let result = add(40, 2);
    expect(result).toEqual(42);
  });
});
