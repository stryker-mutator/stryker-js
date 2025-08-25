import { describe, test, expect } from 'vitest';
import { add, subtract } from './math.ts';

describe('math', () => {
  test('should support simple addition', () => {
    expect(add(1, 2)).toBe(3);
  });

  test('should support simple subtraction', () => {
    expect(subtract(5, 2)).toBe(3);
  });
});
