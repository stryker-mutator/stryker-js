const { isEven } = require('../../src/IsEven');
const { expect } = require('chai');

describe('isEven', () => {

  it('should be false for 1', () => {
    expect(isEven(1)).false;
  });

  it('should be true for 2', () => {
    expect(isEven(2)).true
  });
});
