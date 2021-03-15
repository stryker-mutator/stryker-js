const assert = require('assert');
const app = require('../src/app');

describe('app', () => {
  it('should concat with self', () => {
    assert.strictEqual(app.concatWithFoo('test'), 'workspace-a: test');
  });
});
