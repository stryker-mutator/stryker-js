import { afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';

// Root hooks declared by a test file must only run for that file's tests, not for
// the runner's own setup module.
let befores = 0;
let afters = 0;
beforeEach(() => befores++);
afterEach(() => afters++);

test('first', () => {
  assert.equal(befores, 1);
  assert.equal(afters, 0);
});
test('second', () => {
  assert.equal(befores, 2);
  assert.equal(afters, 1);
});
