import { add } from '../../src/add.js';
import { expect } from 'chai';

describe('add', () => {

  it('2 + 3 = 5', () => {
    expect(add(2, 3)).to.be.equal(5);
  });

  it('1 + 1 = 3... ? (this is the test that should fail)', () => {
    expect(add(1, 1)).to.be.equal(3);
  });
});
