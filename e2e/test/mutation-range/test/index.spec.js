const helloWorld = require('../src/index').helloWorld;

describe('Hello World', () => {
  it('should output hello world', () => {
    expect(helloWorld()).toBe('hello world');
  });
});
