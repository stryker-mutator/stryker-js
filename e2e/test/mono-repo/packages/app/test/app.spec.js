const assert = require('assert');
const app = require('../src/app');

describe('app', () => {
  it('should concat with foo', () => {
    assert.strictEqual(app.concatWithFoo('test'), 'foo: test');
  });
});
