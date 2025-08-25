import { describe, it, expect } from 'vitest';
import { min } from './math.js';

describe('min', () => {
  it('should min 44, 2 = 42', () => {
    expect(min(44, 2)).toEqual(42);
  });
});
