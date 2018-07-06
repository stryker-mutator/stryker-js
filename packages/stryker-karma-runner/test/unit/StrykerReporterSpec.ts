import { expect } from 'chai';
import StrykerReporter, { KarmaSpec } from '../../src/StrykerReporter';
import { TestResult, TestStatus, RunStatus } from 'stryker-api/test_runner';
import { TestResults } from 'karma';

describe('StrykerReporter', () => {

  let sut: StrykerReporter;

  beforeEach(() => {
    sut = StrykerReporter.instance;
  });

  afterEach(() => {
    StrykerReporter.instance.removeAllListeners();
  });

  it('should provide a singleton instance', () => {
    expect(StrykerReporter.instance).eq(StrykerReporter.instance);
    expect(StrykerReporter.instance).instanceOf(StrykerReporter);
  });

  describe('onSpecComplete', () => {
    let events: () => TestResult[];

    beforeEach(() => {
      events = listenTo('test_result');
    });
    it('should emit "test_result"', () => {
      sut.onSpecComplete(undefined, karmaSpec({
        description: '3',
        suite: ['1', '2'],
        time: 64,
        success: true
      }));
      const expectedTestResult: TestResult = {
        name: '1 2 3',
        status: TestStatus.Success,
        timeSpentMs: 64,
        failureMessages: []
      };
      expect(events()).lengthOf(1);
      expect(events()[0]).deep.eq(expectedTestResult);
    });

    it('should convert "skipped" to Timeout', () => {
      sut.onSpecComplete(undefined, karmaSpec({ skipped: true }));
      expect(events()[0]).include({
        status: TestStatus.Skipped
      });
    });

    it('should convert "success" = false to Failed', () => {
      sut.onSpecComplete(undefined, karmaSpec({ success: false }));
      expect(events()[0]).include({
        status: TestStatus.Failed
      });
    });

    it('should assemble the right name when suites is undefined', () => {
      sut.onSpecComplete(undefined, karmaSpec({ suite: [], description: 'foobar' }));
      expect(events()[0]).include({ name: 'foobar' });
    });
  });

  describe('onRunComplete', () => {
    let events: () => RunStatus[];

    beforeEach(() => {
      events = listenTo('run_complete');
    });

    it('should emit "run_complete"', () => {
      sut.onRunComplete(testResults());
      expect(events()).lengthOf(1);
    });

    it('should convert error to RunState.Error', () => {
      sut.onRunComplete(testResults({
        error: true
      }));
      expect(events()[0]).eq(RunStatus.Error);
    });

    it('should convert disconnected to RunState.Timeout', () => {
      sut.onRunComplete(testResults({
        disconnected: true
      }));
      expect(events()[0]).eq(RunStatus.Timeout);
    });
  });

  describe('onBrowserReady', () => {
    it('should emit "browsers_ready"', () => {
      const events = listenTo('browsers_ready');
      sut.onBrowsersReady();
      expect(events()).lengthOf(1);
    });
  });

  describe('onBrowserComplete', () => {
    it('should emit "coverage_report"', () => {
      const events = listenTo('coverage_report');
      const expectedCoverage = { ['foobar.js']: { s: [] } };
      sut.onBrowserComplete(undefined, { coverage: expectedCoverage });
      expect(events()).lengthOf(1);
      expect(events()[0]).eq(expectedCoverage);
    });
  });

  describe('onBrowserError', () => {
    let events: () => string[];

    beforeEach(() => {
      events = listenTo('browser_error');
    });

    it('should emit "browser_error" with error message', () => {
      sut.onBrowserError(undefined, { message: 'foobar error' });
      expect(events()).lengthOf(1);
      expect(events()[0]).eq('foobar error');
    });

    it('should emit "browser_error" with error', () => {
      sut.onBrowserError(undefined, 'foobar error');
      expect(events()).lengthOf(1);
      expect(events()[0]).eq('foobar error');
    });
  });

  describe('onCompileError', () => {
    it('should emit "compile_error" with the errors', () => {
      const events = listenTo('compile_error');
      const expectedErrors = ['foo', 'bar'];
      sut.onCompileError(expectedErrors);
      expect(events()).lengthOf(1);
      expect(events()[0]).eq(expectedErrors);
    });
  });

  function listenTo(eventName: string) {
    let events: any[] = [];
    sut.on(eventName, (event: any) => events.push(event));
    return () => events;
  }

  function karmaSpec(overrides?: Partial<KarmaSpec>): KarmaSpec {
    return Object.assign({
      description: 'baz',
      id: '1',
      skipped: false,
      success: true,
      time: 42,
      suite: ['foo', 'bar'],
      log: []
    }, overrides);
  }

  function testResults(overrides?: Partial<TestResults>): TestResults {
    return Object.assign({
      disconnected: false,
      error: false,
      exitCode: 0,
      failed: 0,
      success: 0
    }, overrides);
  }
});