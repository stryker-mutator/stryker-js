// @ts-check
import { describe, it, expect } from 'vitest';
import { add } from './math.js';

describe('add', () => {
  it('should add 40, 2 = 42', () => {
    let result = add(40, 2);
    expect(result).toEqual(42);
  });
  it('should result in the same number when multiplying by 1', () => {
    let result = math.multiply(42, 1);
    expect(result).toEqual(42);
  });
});
