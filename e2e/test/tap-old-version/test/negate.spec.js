const { test } = require('tap');
const { negate } = require('../src/negate.js');

test('negate', (t) => {
  t.test('should be able to negate a number', (t) => {
    const actual = negate(2);
    t.equal(actual, -2);
    t.end();
  });

  t.end();
});
