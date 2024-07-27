const { notEqual, equal } = require('assert/strict');
const loop = require('./infinite-loop');

it('should handle an infinite loop as a timeout', () => {
  while (true);
});

it('should be able to recover and test others', () => {});

it('should be able to break out of an infinite loop with a hit counter', () => {
  let total = 0;
  loop(5, (n) => {
    notEqual(n, 0);
    total += n;
  });

  equal(total, 15);
});
