{
  const concat = globalThis.concat ?? require('../src/concat').concat;
  const greet = globalThis.greet ?? require('../src/concat').greet;

  describe('concat', () => {
    it('should concat a and b', () => {
      expect(concat('foo', 'bar')).toBe('foobar');
    });
  });

  describe('greet', () => {
    it('should greet me', () => {
      expect(greet('me')).toBe('👋 me')
    });
  });
}
