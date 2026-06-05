import test from 'node:test';
import assert from 'node:assert/strict';
import { getAnswer } from '../src/constants.mjs';

test('the answer is 42', () => {
  assert.equal(getAnswer(), 42);
});
