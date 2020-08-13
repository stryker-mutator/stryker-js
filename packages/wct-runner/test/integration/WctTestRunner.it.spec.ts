import path from 'path';

import { RunResult, RunStatus, TestResult, TestStatus } from '@stryker-mutator/api/test_runner';
import { testInjector } from '@stryker-mutator/test-helpers';
import { normalizeWhitespaces } from '@stryker-mutator/util';
import { expect } from 'chai';

import { WctTestRunner } from '../../src/WctTestRunner';

type TimelessRunResult = {
  [K in keyof RunResult]: RunResult[K] extends TestResult[] ? TimelessTestResult[] : RunResult[K];
};

type TimelessTestResult = Pick<TestResult, Exclude<keyof TestResult, 'timeSpentMs'>>;

describe('WctTestRunner integration', () => {
  // The "root" wct configuration option is always loaded from the current directory.
  // In order to test it properly, we need to grab it before- and reset it after each test.
  let cwd: string;
  const root = path.resolve(__dirname, '..', '..');

  function createSut(): WctTestRunner {
    return testInjector.injector.injectClass(WctTestRunner);
  }

  const expectedHtmlSuiteResult: TimelessRunResult = {
    status: RunStatus.Complete,
    tests: [
      { name: '<awesome-element> is awesome', status: TestStatus.Success, failureMessages: undefined },
      { name: '<failing-element> is failing', status: TestStatus.Failed, failureMessages: ['expected true to be false'] },
      {
        name: '<failing-element> is throwing',
        status: TestStatus.Failed,
        failureMessages: [
          'This element is failing HTMLElement.throw at /components/@stryker-mutator/wct-runner/testResources/htmlTestSuite/src/failing-element.js:11',
        ],
      },
    ],
  };
  // To enable console logging: LoggerFactory.setLogImplementation(consoleLoggerFactory);

  beforeEach(() => {
    cwd = process.cwd();
    testInjector.options.coverageAnalysis = 'off';
  });

  afterEach(() => {
    process.chdir(cwd);
  });

  it('should run in an html suite with root configuration option', async () => {
    // Arrange
    const wctConfigFile = path.resolve(__dirname, '..', '..', 'testResources', 'htmlTestSuite', 'wct.conf.json');
    testInjector.options.wct = {
      configFile: wctConfigFile,
      persistent: true, // should be forced to false
      root,
    };
    const sut = createSut();

    // Act
    await sut.init();
    const result = await sut.run();

    // Assert
    assertRunResult(expectedHtmlSuiteResult, result);
  });

  it('should be able to run twice in quick succession (with cwd)', async () => {
    // Arrange
    process.chdir(path.resolve(__dirname, '..', '..', 'testResources', 'htmlTestSuite'));
    const sut = createSut();

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
    testInjector.options.wct = {
      configFile: wctConfigFile,
      root,
    };
    const sut = createSut();
    const expectedResult: TimelessRunResult = {
      status: RunStatus.Complete,
      tests: [{ name: 'AwesomeLib is awesome', status: TestStatus.Success, failureMessages: undefined }],
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
    testInjector.options.wct = {
      configFile: wctConfigFile,
      root,
    };
    const sut = createSut();
    const expectedResult: TimelessRunResult = {
      status: RunStatus.Complete, // We want to actually expect an error here, but wct doesn't let is.
      tests: [
        {
          name: '',
          status: TestStatus.Failed,
          failureMessages: ['Random error <unknown> at /components/@stryker-mutator/wct-runner/testResources/garbage/test/gargbage-tests.js:1'],
        },
      ],
    };

    // Act
    await sut.init();
    const result = await sut.run();

    // Assert
    assertRunResult(expectedResult, result);
  });

  function assertRunResult(expected: TimelessRunResult, actual: RunResult) {
    expect(actual.errorMessages).eq(expected.errorMessages);
    expect(actual.status).eq(expected.status);
    const actualTestIterator = actual.tests[Symbol.iterator]();
    for (const expectedTest of expected.tests) {
      const actualTest = actualTestIterator.next().value;
      expect(expectedTest.name).eq(actualTest.name);
      expect(expectedTest.status).eq(actualTest.status);
      if (expectedTest.failureMessages) {
        expect(actualTest.failureMessages).ok;
        if (actualTest.failureMessages) {
          const actualFailureMessagesIterator = actualTest.failureMessages[Symbol.iterator]();
          for (const expectedFailureMessage of expectedTest.failureMessages) {
            const actualFailureMessage = actualFailureMessagesIterator.next().value;
            expect(normalizeWhitespaces(actualFailureMessage)).contains(expectedFailureMessage);
          }
        }
      }
    }
  }
});
