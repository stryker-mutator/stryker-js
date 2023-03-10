import test from 'node:test';
import {add} from '../src/math.js';
import assert from 'node:assert/strict';

test('Math lib', test => {
  // This test passes because it does not throw an exception.
  assert.strictEqual(add(1, 2), 3);
})
