import test from 'node:test';
import assert from 'node:assert/strict';
import { add } from '../src/math.mjs';

// Code that runs after an awaited subtest still belongs to the parent test.
test('parent', async (t) => {
  await t.test('child', () => {
    assert.equal(add(1, 1), 2);
  });
  assert.equal(add(2, 2), 4);
});
