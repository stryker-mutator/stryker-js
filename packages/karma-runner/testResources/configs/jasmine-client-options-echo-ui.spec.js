describe('jasmine client options', () => {
  it('should not override client options', function() {
    expect(jasmine.getEnv().configuration().stopSpecOnExpectationFailure).toBe(true);
  });
  it('should override "random" options', function() {
    expect(jasmine.getEnv().configuration().random).toBe(false);
  });
  it('should override "failFast" options', function() {
    expect(jasmine.getEnv().configuration().stopOnSpecFailure).toBe(true);
  });
})
