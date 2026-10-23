import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// One leaf failure inside a suite: node:test bubbles the failure up to the
// `describe` as a synthetic `subtestsFailed` failure. Only the leaf should end
// up in `killedBy`, never the suite container.
describe('failing suite', () => {
  it('this nested test fails', () => {
    assert.equal(1, 2);
  });
});
