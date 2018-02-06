export function createFailResult() {
  return {
    numFailedTestSuites: 1,
    numFailedTests: 2,
    numPassedTestSuites: 0,
    numPassedTests: 0,
    numPendingTestSuites: 0,
    numPendingTests: 0,
    numRuntimeErrorTestSuites: 0,
    numTotalTestSuites: 1,
    numTotalTests: 2,
    startTime: 1513852010583,
    success: false,
    testResults: [
      {
        console: null,
        failureMessage: 'test failed - App.test.js',
        numFailingTests: 2,
        numPassingTests: 0,
        numPendingTests: 0,
        testFilePath: 'App.test.js',
        testResults: [
          {
            ancestorTitles: ['App'],
            duration: 2,
            failureMessages: [
              'Fail message 1',
              'Fail message 2'
            ],
            fullName: 'App render renders without crashing',
            numPassingAsserts: 0,
            status: 'failed',
            title: 'renders without crashing'
          },
          {
            ancestorTitles: ['App'],
            duration: 0,
            failureMessages: [
              'Fail message 3',
              'Fail message 4'
            ],
            fullName: 'App render renders without crashing',
            numPassingAsserts: 0,
            status: 'failed',
            title: 'renders without crashing'
          }
        ],
        coverage: undefined,
        sourceMaps: {},
        skipped: false
      },
      {
        console: null,
        failureMessage: null,
        numFailingTests: 0,
        numPassingTests: 1,
        numPendingTests: 0,
        perfStats: [Object],
        snapshot: [Object],
        testFilePath: 'App.test.js',
        testResults: [
          {
            ancestorTitles: ['App'],
            duration: 23,
            failureMessages: [],
            fullName: 'App renders without crashing',
            numPassingAsserts: 0,
            status: 'passed',
            title: 'renders without crashing'
          }
        ],
        coverage: undefined,
        sourceMaps: {},
        skipped: false
      }
    ],
    wasInterrupted: false
  };
}

export function createSuccessResult() {
  return {
    numFailedTestSuites: 0,
    numFailedTests: 0,
    numPassedTestSuites: 1,
    numPassedTests: 1,
    numPendingTestSuites: 0,
    numPendingTests: 0,
    numRuntimeErrorTestSuites: 0,
    numTotalTestSuites: 1,
    numTotalTests: 1,
    startTime: 1513857548132,
    success: true,
    testResults: [
      {
        console: null,
        failureMessage: null,
        numFailingTests: 0,
        numPassingTests: 1,
        numPendingTests: 0,
        perfStats: [Object],
        snapshot: [Object],
        testFilePath: 'App.test.js',
        testResults: [
          {
            ancestorTitles: ['App'],
            duration: 23,
            failureMessages: [],
            fullName: 'App renders without crashing',
            numPassingAsserts: 0,
            status: 'passed',
            title: 'renders without crashing'
          }
        ],
        coverage: undefined,
        sourceMaps: {},
        skipped: false
      }
    ],
    wasInterrupted: false
  };
}