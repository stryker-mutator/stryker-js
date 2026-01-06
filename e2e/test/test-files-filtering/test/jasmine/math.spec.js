import { add } from '../../src/math.js';

describe('math', () => {
  it('should sum correctly', () => {
    expect(add(1, 2)).toBe(3);
  });
});
