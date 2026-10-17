import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Same test name in two suites of one file: the ids must not collide, or one
// test's coverage overwrites the other's.
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
