// import { DryRunStatus, TestResult, TestStatus } from '@stryker-mutator/api/test-runner';
// import { expect } from 'chai';
// import { TestResults } from 'karma';
// import { MutantCoverage } from '@stryker-mutator/api/core';

// import { StrykerReporter, KarmaSpec } from '../../../src/karma-plugins/stryker-reporter';

// describe('StrykerReporter', () => {
//   let sut: StrykerReporter;

//   beforeEach(() => {
//     sut = StrykerReporter.instance;
//   });

//   it('should provide a singleton instance', () => {
//     expect(StrykerReporter.instance).eq(StrykerReporter.instance);
//     expect(StrykerReporter.instance).instanceOf(StrykerReporter);
//   });

//   describe('onSpecComplete', () => {
//     let events: () => TestResult[];

//     beforeEach(() => {
//       events = listenTo('test_result');
//     });
//     it('should emit "test_result"', () => {
//       sut.onSpecComplete(
//         undefined,
//         karmaSpec({
//           id: '23',
//           description: '3',
//           success: true,
//           suite: ['1', '2'],
//           time: 64,
//         })
//       );
//       const expectedTestResult: TestResult = {
//         id: '23',
//         name: '1 2 3',
//         status: TestStatus.Success,
//         timeSpentMs: 64,
//       };
//       expect(events()).lengthOf(1);
//       expect(events()[0]).deep.eq(expectedTestResult);
//     });

//     it('should convert "skipped" to Timeout', () => {
//       sut.onSpecComplete(undefined, karmaSpec({ skipped: true }));
//       expect(events()[0]).include({
//         status: TestStatus.Skipped,
//       });
//     });

//     it('should convert "success" = false to Failed', () => {
//       sut.onSpecComplete(undefined, karmaSpec({ success: false }));
//       expect(events()[0]).include({
//         status: TestStatus.Failed,
//       });
//     });

//     it('should assemble the right name when suites is undefined', () => {
//       sut.onSpecComplete(undefined, karmaSpec({ suite: [], description: 'foobar' }));
//       expect(events()[0]).include({ name: 'foobar' });
//     });
//   });

//   describe('onRunComplete', () => {
//     let events: () => DryRunStatus[];

//     beforeEach(() => {
//       events = listenTo('run_complete');
//     });

//     it('should emit "run_complete"', () => {
//       sut.onRunComplete(undefined, testResults());
//       expect(events()).lengthOf(1);
//     });

//     it('should convert error to RunState.Error', () => {
//       sut.onRunComplete(undefined, testResults({ error: true }));
//       expect(events()[0]).eq(DryRunStatus.Error);
//     });

//     it('should convert disconnected to RunState.Timeout', () => {
//       sut.onRunComplete(undefined, testResults({ disconnected: true }));
//       expect(events()[0]).eq(DryRunStatus.Timeout);
//     });
//   });

//   describe('onBrowserReady', () => {
//     it('should emit "browsers_ready"', () => {
//       const events = listenTo('browsers_ready');
//       sut.onBrowsersReady();
//       expect(events()).lengthOf(1);
//     });
//   });

//   describe('onBrowserComplete', () => {
//     it('should emit "coverage_report"', () => {
//       const events = listenTo('coverage_report');
//       const expectedCoverage: MutantCoverage = { static: { [1]: 4 }, perTest: {} };
//       sut.onBrowserComplete(undefined, { mutantCoverage: expectedCoverage });
//       expect(events()).lengthOf(1);
//       expect(events()[0]).eq(expectedCoverage);
//     });
//   });

//   describe('onBrowserError', () => {
//     let events: () => string[];

//     beforeEach(() => {
//       events = listenTo('browser_error');
//     });

//     it('should emit "browser_error" with error message', () => {
//       sut.onBrowserError(undefined, { message: 'foobar error' });
//       expect(events()).lengthOf(1);
//       expect(events()[0]).eq('foobar error');
//     });

//     it('should emit "browser_error" with error', () => {
//       sut.onBrowserError(undefined, 'foobar error');
//       expect(events()).lengthOf(1);
//       expect(events()[0]).eq('foobar error');
//     });
//   });

//   function listenTo(eventName: string) {
//     const events: any[] = [];
//     sut.on(eventName, (event: any) => events.push(event));
//     return () => events;
//   }

//   function karmaSpec(overrides?: Partial<KarmaSpec>): KarmaSpec {
//     return Object.assign(
//       {
//         description: 'baz',
//         id: '1',
//         log: [],
//         skipped: false,
//         success: true,
//         suite: ['foo', 'bar'],
//         time: 42,
//       },
//       overrides
//     );
//   }

//   function testResults(overrides?: Partial<TestResults>): TestResults {
//     return Object.assign(
//       {
//         disconnected: false,
//         error: false,
//         exitCode: 0,
//         failed: 0,
//         success: 0,
//       },
//       overrides
//     );
//   }
// });
