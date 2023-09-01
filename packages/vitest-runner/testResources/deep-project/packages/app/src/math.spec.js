import {  add } from './math.js';
import { expect, test, describe } from 'vitest';

describe('math', () => {
  test('should be 5 for add(2, 3)', function () {
    expect(add(2, 3)).toBe(5);
  });
});
