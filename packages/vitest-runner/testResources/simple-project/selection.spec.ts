import { describe, expect, it } from 'vitest';
import { add, isNegativeNumber } from './math.js';

describe(' selection > [suite] # ', () => {
  describe('nested (group)', () => {
    it('adds .* numbers?', () => {
      expect(add(2, 5)).toBe(7);
    });

    it('recognizes a negative number', () => {
      expect(isNegativeNumber(-2)).toBe(true);
    });
  });
});

describe('other suite', () => {
  it('adds .* numbers?', () => {
    expect(add(2, 5)).toBe(7);
  });
});
