import { concat, greet } from '../src/concat.js';

describe('concat', () => {
  it('should concat a and b', () => {
    expect(concat('foo', 'bar')).toBe('foobar');
  });
});

describe('greet', () => {
  it('should greet me', () => {
    expect(greet('me')).toBe('👋 me');
  });
});
