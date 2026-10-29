import test from 'node:test';
import assert from 'node:assert/strict';
import { concat } from '../src/formatter.mjs';

test('concat', () => {
  assert.equal(concat('foo', 'bar'), 'foobar');
});
