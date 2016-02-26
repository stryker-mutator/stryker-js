import TestRunner from '../../../src/api/TestRunner';
import TestRunResult from '../../../src/api/TestRunResult';
import TestResult from '../../../src/api/TestResult';
import StrykerOptions from '../../../src/api/StrykerOptions';
import {expect} from 'chai';

class MyTestRunner extends TestRunner {

  public run(): TestRunResult {
    return {
      specNames: [''],
      succeeded: 5,
      failed: 6,
      result: TestResult.Complete,
      timeSpent: 20,
      coverage: {
        statementMap: {
          '5': { start: { line: 23, column: 23 }, end: { line: 23, column: 23 } },
        },
        s: {
          '5': 23
        }
      }
    };
  }

  public getOptions() {
    return this.options;
  }
}

describe('TestRunner', () => {

  let sut: TestRunner,
    options: StrykerOptions;

  before(() => {
    options = { karma: { 'my-karma-options': {} } };
    sut = new MyTestRunner(options);
  });

  it('should supply options', () => {
    expect((<MyTestRunner>sut).getOptions()).to.be.eq(options);
  });
  
  it('should run', () => {
    expect(sut.run()).to.be.ok;
  });

});