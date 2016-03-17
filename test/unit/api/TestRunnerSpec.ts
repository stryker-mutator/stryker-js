import {TestRunner, RunResult as RunResult, TestResult} from '../../../src/api/test_runner';
import {StrykerOptions} from '../../../src/api/core';
import {expect} from 'chai';

class MyTestRunner extends TestRunner {

  public run(): Promise<RunResult> {
    return new Promise<RunResult>(res => res({
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
    return this.options;
  }
}

describe('TestRunner', () => {

  let sut: TestRunner,
    strykerOptions: StrykerOptions;

  before(() => {
    strykerOptions = { testFrameork: '', testRunner: '', port: 23, karma: { 'my-karma-options': {} } };
    sut = new MyTestRunner({ sourceFiles: [], additionalFiles: [], strykerOptions, port: 58 });
  });

  it('should supply options', () => {
    expect((<MyTestRunner>sut).getOptions().strykerOptions).to.be.eq(strykerOptions);
  });

  it('should run', () => {
    expect(sut.run({ timeout: 5000 })).to.be.ok;
  });

});