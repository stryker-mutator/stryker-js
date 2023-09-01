import { expect } from 'chai';
import { add } from './math.js';

describe(add.name, () => {
  it('should add 40, 2 to be 42', () => {
    expect(add(40, 2)).eq(42);
  })
});
