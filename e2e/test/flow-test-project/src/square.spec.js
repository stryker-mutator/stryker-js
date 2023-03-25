import { square } from './square';
import { expect } from 'chai';

describe('square', () => {
  it('should provide 4 when given 2', () => {
    expect(square(2)).eq(4);
  });
});
