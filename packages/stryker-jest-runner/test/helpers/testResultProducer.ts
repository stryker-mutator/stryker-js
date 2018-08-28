export function createFailResult() {
  return {
    numFailedTests: 2,
    numFailedTestSuites: 1,
    numPassedTests: 0,
    numPassedTestSuites: 0,
    numPendingTests: 0,
    numPendingTestSuites: 0,
    numRuntimeErrorTestSuites: 0,
    numTotalTests: 2,
    numTotalTestSuites: 1,
    startTime: 1513852010583,
    success: false,
    testResults: [
      {
        console: null,
        coverage: undefined,
        failureMessage: 'test failed - App.test.js',
        numFailingTests: 2,
        numPassingTests: 0,
        numPendingTests: 0,
        skipped: false,
        sourceMaps: {},
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
        ]
      },
      {
        console: null,
        coverage: undefined,
        failureMessage: null,
        numFailingTests: 0,
        numPassingTests: 1,
        numPendingTests: 0,
        perfStats: [Object],
        skipped: false,
        snapshot: [Object],
        sourceMaps: {},
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
        ]
      }
    ],
    wasInterrupted: false
  };
}

export function createSuccessResult() {
  return {
    numFailedTests: 0,
    numFailedTestSuites: 0,
    numPassedTests: 1,
    numPassedTestSuites: 1,
    numPendingTests: 0,
    numPendingTestSuites: 0,
    numRuntimeErrorTestSuites: 0,
    numTotalTests: 1,
    numTotalTestSuites: 1,
    startTime: 1513857548132,
    success: true,
    testResults: [
      {
        console: null,
        coverage: undefined,
        failureMessage: null,
        numFailingTests: 0,
        numPassingTests: 1,
        numPendingTests: 0,
        perfStats: [Object],
        skipped: false,
        snapshot: [Object],
        sourceMaps: {},
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
        ]
      }
    ],
    wasInterrupted: false
  };
}
