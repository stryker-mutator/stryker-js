const {sum, sub} = require('../src/sum');

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});
test('sub 1 - 0 to equal 1', () => {
  expect(sub(1, 0)).toBe(1);
});
