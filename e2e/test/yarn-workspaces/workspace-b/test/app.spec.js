const assert = require('assert');
const app = require('workspace-a');

describe('app', () => {
  it('should concat with workspace-a', () => {
    assert.strictEqual(app.concatWithFoo('test'), 'workspace-a: test');
  });
});
