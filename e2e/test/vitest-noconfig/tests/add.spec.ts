import { add } from '../src/add';
import { expect, test, describe } from 'vitest';

describe('add', () => {
  test('should be able to add two numbers', function () {
    const actual = add(5, 2);
    expect(actual).toBe(7);
  });
});
