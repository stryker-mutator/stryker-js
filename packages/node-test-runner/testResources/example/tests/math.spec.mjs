import test from 'node:test';
import assert from 'node:assert/strict';
import { add, slowAdd } from '../src/math.mjs';

test('add', () => {
  assert.equal(add(2, 3), 5);
});

test('slowAdd', () => {
  assert.equal(slowAdd(2, 3), 5);
});
