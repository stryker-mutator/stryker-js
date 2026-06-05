import test from 'node:test';
import { equal } from 'node:assert/strict';

import { isNegativeNumber } from '../src/is-negative.js';

test('math - should be able to recognize a negative number', (t) => {
  const number = -2;
  const result = isNegativeNumber(number);
  equal(result, true);
});
