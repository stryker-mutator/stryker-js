import { describe, expect, it } from 'vitest';
import { add, isPositive } from '../src/math.js';

describe('math', () => {
  it('should add two numbers', () => {
    expect(add(1, 2)).toBe(3);
  });

  it('should determine if a number is positive', () => {
    expect(isPositive(1)).toBe(true);
    expect(isPositive(0)).toBe(false);
    expect(isPositive(-1)).toBe(false);
  });
});
