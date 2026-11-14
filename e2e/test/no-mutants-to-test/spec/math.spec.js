import { expect } from 'chai';

import { add } from '../src/math.js';

describe('add', () => {
  it('should add two numbers', () => {
    expect(add(2, 3)).eq(5);
  });
});
