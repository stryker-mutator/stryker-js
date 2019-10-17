import { TestResult, TestStatus } from '@stryker-mutator/api/test_runner';
import { expect } from 'chai';
import { EventEmitter } from 'events';
import * as sinon from 'sinon';
import { TestEndData } from 'web-component-tester/runner/clireporter';
import WctReporter from '../../src/WctReporter';

describe(WctReporter.name, () => {
  let context: EventEmitter;
  let sut: WctReporter;

  beforeEach(() => {
    context = new EventEmitter();
    sinon.useFakeTimers();
    sut = new WctReporter(context);
  });

  afterEach(() => {
    sut.dispose();
    expect(context.listenerCount('test-end')).eq(0);
    expect(context.listenerCount('test-start')).eq(0);
  });

  it('should report no tests', () => {
    expect(sut.results).lengthOf(0);
    expect(context.listenerCount('test-end')).eq(1);
    expect(context.listenerCount('test-start')).eq(1);
  });

  it('should report a passing test', () => {
    actAssertReportTest(
      {
        duration: 2,
        error: null,
        state: 'passing',
        test: ['fooSpec.js', 'Foo', 'bar()', 'should baz']
      },
      10,
      { name: 'Foo bar() should baz', status: TestStatus.Success, timeSpentMs: 10, failureMessages: undefined }
    );
  });

  it('should report a failing test with error as string', () => {
    actAssertReportTest({ duration: 2, error: 'fooError', state: 'failing', test: ['fooSpec.js', 'true should be false'] }, 40, {
      failureMessages: ['fooError'],
      name: 'true should be false',
      status: TestStatus.Failed,
      timeSpentMs: 40
    });
  });

  it('should report a failing test with error as serialized error', () => {
    actAssertReportTest({ duration: 2, error: { stack: 'fooError' }, state: 'failing', test: ['fooSpec.js', 'true should be false'] }, 40, {
      failureMessages: ['fooError'],
      name: 'true should be false',
      status: TestStatus.Failed,
      timeSpentMs: 40
    });
  });

  it('should report a failing test with error as object', () => {
    actAssertReportTest({ duration: 2, error: { a: 'fooError' }, state: 'failing', test: ['fooSpec.js', 'true should be false'] }, 40, {
      failureMessages: ['{"a":"fooError"}'],
      name: 'true should be false',
      status: TestStatus.Failed,
      timeSpentMs: 40
    });
  });

  it('should report a failing test with error as number', () => {
    actAssertReportTest({ duration: 2, error: 42, state: 'failing', test: ['fooSpec.js', 'true should be false'] }, 40, {
      failureMessages: ['42'],
      name: 'true should be false',
      status: TestStatus.Failed,
      timeSpentMs: 40
    });
  });

  it('should report a failing test with error as string', () => {
    actAssertReportTest({ duration: 2, error: 'fooError', state: 'failing', test: ['fooSpec.js', 'true should be false'] }, 40, {
      failureMessages: ['fooError'],
      name: 'true should be false',
      status: TestStatus.Failed,
      timeSpentMs: 40
    });
  });

  it('should report a skipped test', () => {
    actAssertReportTest({ duration: 2, error: undefined, state: 'pending', test: ['fooSpec.js', 'true should be false'] }, 40, {
      failureMessages: undefined,
      name: 'true should be false',
      status: TestStatus.Skipped,
      timeSpentMs: 40
    });
  });

  function actAssertReportTest(actualTestData: TestEndData, actualTimeSpent: number, expectedTestResult: TestResult) {
    // Act
    raiseTestStarted();
    sinon.clock.tick(actualTimeSpent);
    raiseTestEnded(actualTestData);

    // Assert
    const expectedTestResults: TestResult[] = [expectedTestResult];
    expect(sut.results).deep.eq(expectedTestResults);
  }

  function raiseTestEnded(testEndData: TestEndData) {
    context.emit('test-end', null, testEndData);
  }

  function raiseTestStarted() {
    context.emit('test-start');
  }
});
