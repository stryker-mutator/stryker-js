import { negate } from '../src/negate';
import { expect, test, describe } from 'vitest';

describe('negate', () => {
  test('should be able negate a number', function () {
    const actual = negate(2);
    expect(actual).toBe(-2);
  });
});
