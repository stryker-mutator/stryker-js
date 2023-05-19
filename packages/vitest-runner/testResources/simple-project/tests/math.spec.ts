import { describe, test, expect } from 'vitest';

describe('math', () => {

  test('should be able to add one to a number', function () {
    const number = 2;
    const expected = 3;

    const actual = math.addOne(number);

    expect(actual).toBe(expected);
  });

  test('should be able negate a number', function () {
    const number = 2;
    const expected = -2;

    const actual = math.negate(number);

    expect(actual).toBe(expected);
  });

  test('should be able to recognize a negative number', function () {
    const number = -2;

    const isNegative = math.isNegativeNumber(number);

    expect(isNegative).toBe(true);
  });
});
