import { add } from '../src/math.js';
import { expect } from 'chai';

describe(add.name, () => {
  // Both tests kill the same mutant, necessary to test disableBail
  it('should result in 42 for 40 and 2', () => {
    expect(add(40, 2)).eq(42);
  });
  it('should result in 42 for 41 and 1', () => {
    expect(add(41, 1)).eq(42);
  });
});
