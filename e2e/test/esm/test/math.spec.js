import { add, greet, inc } from '../src/lib.js';

describe('lib', () => {
  it('should result in 42 for add 40 and 2', () => {
    expect(add(40, 2)).toEqual(42);
  });
  it('should greet world', () => {
    expect(greet('world')).toEqual('👋 world');
  });

  it('should result in 1 when inc 0', () => {
    inc(0);
    // Forget the expect 🙄 should survive
  })
});
