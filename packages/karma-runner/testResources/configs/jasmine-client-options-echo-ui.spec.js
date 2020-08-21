describe('jasmine client options', () => {
  it('should not override client options', function() {
    expect(jasmine.getEnv().configuration().oneFailurePerSpec).toBe(true);
  });
  it('should override "random" options', function() {
    expect(jasmine.getEnv().configuration().random).toBe(false);
  });
  it('should override "failFast" options', function() {
    expect(jasmine.getEnv().configuration().failFast).toBe(true);
  });
})
