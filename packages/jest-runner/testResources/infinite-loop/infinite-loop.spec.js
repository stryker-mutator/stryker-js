var loop = require('./infinite-loop');
var expect = require('chai');

it('should handle an infinite loop as a timeout', () => {
  while (true);
});

it('should be able to recover and test others', () => {});

it('should be able to break out of an infinite loop with a hit counter', () => {
  let total = 0;
  loop(5, (n) => {
    expect(n).not.toBe(0);
    total += n;
  });
  expect(total).toBe(15);
});
