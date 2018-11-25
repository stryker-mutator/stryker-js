import * as path from 'path';
import WctTestRunner from '../../src/WctTestRunner';
import { expect } from 'chai';
import { RunResult, TestStatus, RunStatus, TestResult } from 'stryker-api/test_runner';

type TimelessRunResult = {
  [K in keyof RunResult]: RunResult[K] extends TestResult[] ? TimelessTestResult[] : RunResult[K];
};

type TimelessTestResult = Pick<TestResult, Exclude<keyof TestResult, 'timeSpentMs'>>;

describe('WctTestRunner integration', () => {

  // The "root" wct configuration option is always loaded from the current directory.
  // In order to test it properly, we need to grab it before- and reset it after each test.
  let cwd: string;
  const root = path.resolve(__dirname, '..', '..', '..', '..');

  // To enable console logging: LoggerFactory.setLogImplementation(consoleLoggerFactory);

  beforeEach(() => {
    cwd = process.cwd();
  });

  afterEach(() => {
    process.chdir(cwd);
  });

  it('should run in an html suite with root configuration option', async () => {
    // Arrange
    const wctConfigFile = path.resolve(__dirname, '..', '..', 'testResources', 'htmlTestSuite', 'wct.conf.json');
    const sut = new WctTestRunner({
      strykerOptions: {
        wct: {
          configFile: wctConfigFile,
          root
        }
      }
    });
    const expectedResult: TimelessRunResult = {
      status: RunStatus.Complete,
      tests: [
        { name: '<awesome-element> is awesome', status: TestStatus.Success },
        { name: '<failing-element> is failing', status: TestStatus.Failed },
        { name: '<failing-element> is throwing', status: TestStatus.Failed }
      ]
    };

    // Act
    await sut.init();
    const result = await sut.run();

    // Assert
    assertRunResult(expectedResult, result);
  });

  it('should be able to run twice in quick succession with with changed cwd', async () => {
    // Arrange
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

    // Act
    await sut.init();
    await sut.run();
    const result = await sut.run();

    // Assert
    assertRunResult(expectedResult, result);
  });

  it('should run in a js suite', async () => {
    // Arrange
    const wctConfigFile = path.resolve(__dirname, '..', '..', 'testResources', 'jsTestSuite', 'wct.conf.json');
    const sut = new WctTestRunner({
      strykerOptions: {
        wct: {
          configFile: wctConfigFile,
          root
        }
      }
    });
    const expectedResult: TimelessRunResult = {
      status: RunStatus.Complete,
      tests: [{ name: 'AwesomeLib is awesome', status: TestStatus.Success }]
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
    const sut = new WctTestRunner({
      strykerOptions: {
        wct: {
          configFile: wctConfigFile,
          root
        }
      }
    });
    const expectedResult: TimelessRunResult = {
      status: RunStatus.Complete, // We want to actually expect an error here, but wct doesn't let is.
      tests: [{ name: '', status: TestStatus.Failed }]
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
