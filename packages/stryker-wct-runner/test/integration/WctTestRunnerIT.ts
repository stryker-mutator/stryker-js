import { expect } from 'chai';
import * as path from 'path';
import { StrykerOptions } from 'stryker-api/core';
import { RunResult, RunStatus, TestResult, TestStatus } from 'stryker-api/test_runner';
import WctTestRunner from '../../src/WctTestRunner';

type TimelessRunResult = {
  [K in keyof RunResult]: RunResult[K] extends TestResult[] ? TimelessTestResult[] : RunResult[K];
};

type TimelessTestResult = Pick<TestResult, Exclude<keyof TestResult, 'timeSpentMs'>>;

describe('WctTestRunner integration', () => {

  // The "root" wct configuration option is always loaded from the current directory.
  // In order to test it properly, we need to grab it before- and reset it after each test.
  let cwd: string;
  let settings: { strykerOptions: StrykerOptions };
  const root = path.resolve(__dirname, '..', '..', '..', '..');

  const expectedHtmlSuiteResult: TimelessRunResult = {
    status: RunStatus.Complete,
    tests: [
      { name: '<awesome-element> is awesome', status: TestStatus.Success, failureMessages: undefined },
      { name: '<failing-element> is failing', status: TestStatus.Failed, failureMessages: ['expected true to be false\n  Context.<anonymous> at failing-tests.html:10'] },
      { name: '<failing-element> is throwing', status: TestStatus.Failed, failureMessages: ['This element is failing\n  HTMLElement.throw at /components/stryker-parent/packages/stryker-wct-runner/testResources/htmlTestSuite/src/failing-element.js:11\n       Context.test at failing-tests.html:13'] }
    ]
  };
  // To enable console logging: LoggerFactory.setLogImplementation(consoleLoggerFactory);

  beforeEach(() => {
    cwd = process.cwd();
    settings = { strykerOptions: { coverageAnalysis: 'off' } };
  });

  afterEach(() => {
    process.chdir(cwd);
  });

  it('should run in an html suite with root configuration option', async () => {
    // Arrange
    const wctConfigFile = path.resolve(__dirname, '..', '..', 'testResources', 'htmlTestSuite', 'wct.conf.json');
    settings.strykerOptions.wct = {
      configFile: wctConfigFile,
      persistent: true, // should be forced to false
      root
    };
    const sut = new WctTestRunner(settings);

    // Act
    await sut.init();
    const result = await sut.run();

    // Assert
    assertRunResult(expectedHtmlSuiteResult, result);
  });

  it('should be able to run twice in quick succession (with cwd)', async () => {
    // Arrange
    process.chdir(path.resolve(__dirname, '..', '..', 'testResources', 'htmlTestSuite'));
    const sut = new WctTestRunner(settings);

    // Act
    await sut.init();
    await sut.run();
    const result = await sut.run();

    // Assert
    assertRunResult(expectedHtmlSuiteResult, result);
  });

  it('should run in a js suite', async () => {
    // Arrange
    const wctConfigFile = path.resolve(__dirname, '..', '..', 'testResources', 'jsTestSuite', 'wct.conf.json');
    settings.strykerOptions.wct = {
      configFile: wctConfigFile,
      root
    };
    const sut = new WctTestRunner(settings);
    const expectedResult: TimelessRunResult = {
      status: RunStatus.Complete,
      tests: [{ name: 'AwesomeLib is awesome', status: TestStatus.Success, failureMessages: undefined }]
    };

    // Act
    await sut.init();
    const result = await sut.run();

    // Assert
    assertRunResult(expectedResult, result);
  });

  it('should fail with ~~error~~ _failed_ if a suite is garbage', async () => {
    // Arrange
    const wctConfigFile = path.resolve(__dirname, '..', '..', 'testResources', 'garbage', 'wct.conf.json');
    settings.strykerOptions.wct = {
      configFile: wctConfigFile,
      root
    };
    const sut = new WctTestRunner(settings);
    const expectedResult: TimelessRunResult = {
      status: RunStatus.Complete, // We want to actually expect an error here, but wct doesn't let is.
      tests: [{ name: '', status: TestStatus.Failed, failureMessages: ['Random error\n  <unknown> at /components/stryker-parent/packages/stryker-wct-runner/testResources/garbage/test/gargbage-tests.js:1'] }]
    };

    // Act
    await sut.init();
    const result = await sut.run();

    // Assert
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
