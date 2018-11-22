import * as path from 'path';
import WctTestRunner from '../../src/WctTestRunner';
import { expect } from 'chai';
import { RunResult, TestStatus, RunStatus, TestResult } from 'stryker-api/test_runner';

type TimelessRunResult = {
  [K in keyof RunResult]: RunResult[K] extends TestResult[] ? TimelessTestResult[] : RunResult[K];
};

type TimelessTestResult = Pick<TestResult, Exclude<keyof TestResult, 'timeSpentMs'>>;

describe('WctTestRunner integration', () => {

  it('should run in an html suite', async () => {
    process.chdir(path.resolve(__dirname, '..', '..', 'testResources', 'htmlTestSuite'));
    const sut = new WctTestRunner({ strykerOptions: {} });
    const expectedResult: TimelessRunResult = {
      status: RunStatus.Complete,
      tests: [
        { name: '<awesome-element> is awesome', status: TestStatus.Success },
        { name: '<failing-element> is failing', status: TestStatus.Failed },
        { name: '<failing-element> is throwing', status: TestStatus.Failed }
      ]
    };
    const result = await sut.run();
    assertRunResult(expectedResult, result);
  });

  function assertRunResult(expected: TimelessRunResult, actual: RunResult) {
    actual.tests.forEach(testResult => {
      expect(testResult.timeSpentMs).gte(0);
      delete testResult.timeSpentMs;
    });
    expect(actual).deep.eq(expected);
  }
});
