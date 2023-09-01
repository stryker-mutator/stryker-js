const { test } = require('tap');
const { increment } = require('../src/increment.js');

test('increment', (t) => {
  t.test('should be able to add one to a number', (t) => {
    const number = 2;
    const expected = 3;

    const actual = increment(number);

    t.equal(actual, expected);
    t.end();
  });

  t.end();
});
