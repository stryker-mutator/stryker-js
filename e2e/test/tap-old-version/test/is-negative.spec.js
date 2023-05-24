const { test } = require('tap');
const { isNegativeNumber } = require('../src/is-negative.js');

test('math - should be able to recognize a negative number', (t) => {
  const number = -2;
  const result = isNegativeNumber(number);
  t.equal(result, true);
  t.end();
});
