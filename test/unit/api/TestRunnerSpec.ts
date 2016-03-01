import {TestRunner, RunResult as TestRunResult, TestResult} from '../../../src/api/test_runner';
import {StrykerOptions} from '../../../src/api/core';
import {expect} from 'chai';

class MyTestRunner extends TestRunner {

  public run(): Promise<TestRunResult> {
    return new Promise<TestRunResult>(res => res({
      specNames: [''],
      succeeded: 5,
      failed: 6,
      result: TestResult.Complete,
      timeSpent: 20,
      coverage: {
        '': {
          statementMap: {
            '5': { start: { line: 23, column: 23 }, end: { line: 23, column: 23 } },
          },
          s: {
            '5': 23
          }
        }
      }
    }));
  }

  public getOptions() {
    return this.strykerOptions;
  }
}

describe('TestRunner', () => {

  let sut: TestRunner,
    options: StrykerOptions;

  before(() => {
    options = { karma: { 'my-karma-options': {} } };
    sut = new MyTestRunner([], [], null, options);
  });

  it('should supply options', () => {
    expect((<MyTestRunner>sut).getOptions()).to.be.eq(options);
  });

  it('should run', () => {
    expect(sut.run({timeout: 5000})).to.be.ok;
  });

});