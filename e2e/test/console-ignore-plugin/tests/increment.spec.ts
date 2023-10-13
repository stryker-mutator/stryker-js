import { increment } from '../src/increment';
import { expect, test, describe } from 'vitest';

describe('increment', () => {

  test('should be able to add one to a number', function () {
    var number = 2;
    var expected = 3;

    var actual = increment(number);

    expect(actual).toBe(expected);
  });

});
