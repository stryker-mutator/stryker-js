import test from 'ava';

import { isNegativeNumber } from '../src/is-negative.js';

test('math - should be able to recognize a negative number', (t) => {
  const number = -2;
  const result = isNegativeNumber(number);
  t.is(result, true);
});
