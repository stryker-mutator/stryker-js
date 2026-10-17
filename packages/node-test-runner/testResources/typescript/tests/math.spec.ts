import test from 'node:test';
import assert from 'node:assert/strict';
import { add } from '../src/math.ts';

test('add', () => {
  assert.equal(add(10, 5), 15);
});
