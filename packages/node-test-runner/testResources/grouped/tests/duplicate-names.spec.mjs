import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Same test name in two suites of one file, and the same full name twice: the
// ids must not collide, or one test's coverage and duration overwrite the other's.
test('repeated', () => {
  assert.ok(true);
});
test('repeated', () => {
  assert.ok(true);
});
describe('first suite', () => {
  it('works', () => {
    assert.ok(true);
  });
});
describe('second suite', () => {
  it('works', () => {
    assert.ok(true);
  });
});
