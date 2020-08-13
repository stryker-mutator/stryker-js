const { add } = require('../../src/add');
const { expect } = require('chai');

describe('add', () => {

  it('2 + 3 = 5', () => {
    expect(add(2, 3)).to.be.equal(5);
  });

});
