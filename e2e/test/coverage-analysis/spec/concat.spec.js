{
  const concat = globalThis.concat ?? require('../src/concat').concat;

  describe('concat', () => {
    it('should concat a and b', () => {
      expect(concat('foo', 'bar')).toBe('foobar');
    });
  });
}
