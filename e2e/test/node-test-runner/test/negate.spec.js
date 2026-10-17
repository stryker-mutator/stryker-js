import test from 'node:test';
import { equal } from 'node:assert/strict';

import { negate } from '../src/negate.js';

test('negate', async (t) => {
  await t.test('should be able to negate a number', (t) => {
    const actual = negate(2);
    equal(actual, -2);
  });
});
