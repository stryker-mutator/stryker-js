import test from 'node:test';
import {add, slowAdd} from '../src/math.js';
import assert from 'node:assert/strict';

test('Add test', test => {
  // This test passes because it does not throw an exception.
  assert.strictEqual(add(1, 2), 3);
})

test('Slow add test', test => {
  // This test passes because it does not throw an exception.
  assert.strictEqual(slowAdd(1, 2), 3);
})
