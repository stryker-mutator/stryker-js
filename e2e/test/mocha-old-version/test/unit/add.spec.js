const { add } = require('../../src/add');
const { equal } = require('assert/strict');

describe('add', () => {
  it('2 + 3 = 5', () => {
    equal(add(2, 3), 5);
  });
});
