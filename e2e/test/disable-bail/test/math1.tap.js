const { test } = require('tap');
const { add } = require('../src/math');

test(add.name, (t) => {
  // Both kill the same mutant
  t.test('should result in 42 for 40 and 2', (t) => {
    t.equal(add(40, 2), 42);
    t.end();
  });

  t.end();
});
