import test from 'node:test';
import assert from 'node:assert/strict';
import { add } from './math.js';

test('1 + 1 equals 2', () => {
  assert.equal(add(1, 1), 2);
});
