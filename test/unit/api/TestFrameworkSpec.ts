import {StrykerOptions} from '../../../src/api/core';
import TestFramework from '../../../src/api/TestFramework';
import {expect} from 'chai';

class MyTestFramework extends TestFramework {

  chooseTest(n: number) {

  }

  prepareTestFiles(testFilePaths: string[]) {
    return testFilePaths;
  }

  getOptions() {
    return this.options;
  }
}

describe('TestRunner', () => {

  let sut: TestFramework,
    options: StrykerOptions;

  before(() => {
    options = { jasmine: { 'my-jasmine-options': {} } };
    sut = new MyTestFramework(options);
  });

  it('should supply options', () => {
    expect((<MyTestFramework>sut).getOptions()).to.be.eq(options);
  });

});