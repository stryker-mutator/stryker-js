import test from 'node:test';
import { equal } from 'node:assert/strict';

import { increment } from '../src/increment.js';

test('increment', (t) => {
  t.test('should be able to add one to a number', (t) => {
    const number = 2;
    const expected = 3;

    const actual = increment(number);

    equal(actual, expected);
  });
});
