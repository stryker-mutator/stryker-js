import { expect, it, describe } from 'vitest';
import { pi } from '../math';

describe('pi', () => {
  it('should be 3.14', () => {
    expect(pi).toBe(3.14);
  });
});
