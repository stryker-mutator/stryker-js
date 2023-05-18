import { add, addOne, isNegativeNumber, negate } from '../src/math';
import { expect, test, describe } from 'vitest';

describe('math', () => {
  test('should be able to add two numbers', function () {
    var num1 = 2;
    var num2 = 5;
    var expected = num1 + num2;

    var actual = add(num1, num2);

    expect(actual).toBe(expected);
  });

  test('should be able to add one to a number', function () {
    var number = 2;
    var expected = 3;

    var actual = addOne(number);

    expect(actual).toBe(expected);
  });

  test('should be able negate a number', function () {
    var number = 2;
    var expected = -2;

    var actual = negate(number);

    expect(actual).toBe(expected);
  });

  test('should be able to recognize a negative number', function () {
    var number = -2;

    var isNegative = isNegativeNumber(number);

    expect(isNegative).toBe(true);
  });
});
