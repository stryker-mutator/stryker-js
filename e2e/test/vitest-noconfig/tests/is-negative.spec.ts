import { isNegativeNumber } from '../src/is-negative';
import { expect, test, describe } from 'vitest';

describe('math', () => {
  
  test('should be able to recognize a negative number', function () {
    const number = -2;
    const result = isNegativeNumber(number);
    expect(result).toBe(true);
  });
});
