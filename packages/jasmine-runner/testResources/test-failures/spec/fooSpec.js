import { foo } from '../lib/foo.js';

describe('foo', () => {
  it('should be baz', () => {
    expect(foo).toBe('baz'); // not true, actually 'bar'
  });
  it('should be qux', () => {
    expect(foo).toBe('qux'); // not true, actually 'bar'
  });
});
