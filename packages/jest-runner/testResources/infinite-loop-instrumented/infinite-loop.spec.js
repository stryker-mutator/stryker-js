var loop = require('./infinite-loop');
var expect = require('chai');

it('should handle an infinite loop as a timeout', () => {
  n = 0;
  while (n < 20) {
    n += 1;
    console.log(n);
  }
});

it('should be able to recover and test others', () => {});

it('should be able to break out of an infinite loop with a hit counter', () => {
  let total = 0;
  loop(5, (n) => {
    console.log(n);
    expect(n).not.toBe(0);
    total += n;
  });
  expect(total).toBe(15);
});
