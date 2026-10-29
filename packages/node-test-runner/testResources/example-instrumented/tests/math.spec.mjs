import test from 'node:test';
import assert from 'node:assert/strict';
import { add, slowAdd } from '../src/math.mjs';

test('add', () => {
  assert.equal(add(10, 5), 15);
});

test('slowAdd', () => {
  assert.equal(slowAdd(10, 5), 15);
});
