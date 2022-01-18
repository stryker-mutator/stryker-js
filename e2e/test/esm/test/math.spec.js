import { add, greet } from '../src/lib.js';

describe('lib', () => {
  it('should result in 42 for 40 and 2', () => {
    expect(add(40, 2)).toEqual(42);
  });
  it('should greet world', () => {
    expect(greet('world')).toEqual('👋 world');
  });
});
