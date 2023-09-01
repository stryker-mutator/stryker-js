import { describe, it, expect } from 'vitest';

describe('min', () => {
  it('should min 44, 2 = 42', () => {
    expect(min(44, 2)).toEqual(42);
  });
});
