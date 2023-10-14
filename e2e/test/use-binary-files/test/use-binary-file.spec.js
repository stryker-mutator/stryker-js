import foo from '../foo.js';

describe('should do x', function () {
  it('xxx', function () {
    console.log('hello');
    const result = foo();
    console.log(result.length);
    if (result.length !== 12077) {
      throw new Error(`Error getting result : ${result.length}`);
    }
  });
});
