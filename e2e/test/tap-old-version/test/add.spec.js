const { test } = require('tap');
const { add } = require('../src/add.js');

test('add', (t) => {
  t.test('should be able to add two numbers', (t) => {
    const actual = add(5, 2);
    t.equal(actual, 7);
    t.end();
  });

  t.end();
});
