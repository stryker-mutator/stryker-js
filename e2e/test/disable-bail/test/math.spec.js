let add = globalThis.add;
if (typeof require === 'function') {
  add = require('../src/math').add;
}
if(typeof expect === 'undefined'){
  globalThis.expect = require('chai').expect;
}

describe(add.name, () => {
  // Both tests kill the same mutant, necessary to test disableBail
  it('should result in 42 for 40 and 2', () => {
    expect(add(40, 2)).toEqual(42);
  });
  it('should result in 42 for 41 and 1', () => {
    expect(add(41, 1)).toEqual(42);
  });
});
