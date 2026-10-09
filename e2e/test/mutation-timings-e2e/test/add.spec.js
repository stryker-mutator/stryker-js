import { expect } from 'chai';

import { add } from '../src/add.js';

describe('add', function () {
  it('should add two numbers', function () {
    expect(add(2, 3)).to.be.equal(5);
  });
});
