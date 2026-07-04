import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// A `describe`/`it` suite: node:test emits a `test:pass` for the `describe`
// container too, which the runner must NOT report as a test of its own.
describe('outer suite', () => {
  it('passes a', () => {
    assert.ok(true);
  });
  it('passes b', () => {
    assert.ok(true);
  });
});

// A `test()` with a subtest: the parent is reported (it is indistinguishable
// from a leaf and may carry assertions), the child is reported too.
test('parent test', (t) => {
  t.test('nested child', () => {
    assert.ok(true);
  });
});
