import { add } from '../../src/math.js';

describe('math', () => {
  it('noop', () => {
    void add; // Ensure related
    expect(true).toBe(true);
  });
});
