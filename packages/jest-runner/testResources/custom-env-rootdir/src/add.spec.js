const { add } = require('./add');

test('add', () => {
  expect(add(1, 2)).toBe(3);
});
