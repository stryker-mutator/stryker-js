import { JestOptions } from '../../src-generated/jest-runner-options';

export const createJestOptions = (overrides?: Partial<JestOptions>): JestOptions => {
  return {
    enableFindRelatedTests: true,
    projectType: 'custom',
    ...overrides
  };
};

export const createFailResult = () => ({
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
          failureMessages: ['Fail message 1', 'Fail message 2'],
          fullName: 'App render renders without crashing',
          numPassingAsserts: 0,
          status: 'failed',
          title: 'renders without crashing'
        },
        {
          ancestorTitles: ['App'],
          duration: 0,
          failureMessages: ['Fail message 3', 'Fail message 4'],
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
});

export const createSuccessResult = () => ({
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
});

export const createPendingResult = () => ({
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
      testResults: [
        {
          ancestorTitles: ['App'],
          duration: 0,
          failureMessages: [],
          fullName: 'App renders without crashing',
          numPassingAsserts: 0,
          status: 'pending',
          title: 'renders without crashing'
        }
      ]
    }
  ],
  wasInterrupted: false
});

export const createTodoResult = () => ({
  numFailedTests: 0,
  numFailedTestSuites: 0,
  numPassedTests: 1,
  numPassedTestSuites: 1,
  numPendingTests: 0,
  numPendingTestSuites: 0,
  numRuntimeErrorTestSuites: 0,
  numTodoTests: 1,
  numTotalTests: 2,
  numTotalTestSuites: 1,
  startTime: 1551045971122,
  success: true,
  testResults: [
    {
      console: null,
      coverage: undefined,
      displayName: undefined,
      failureMessage: null,
      leaks: false,
      numFailingTests: 0,
      numPassingTests: 1,
      numPendingTests: 0,
      numTodoTests: 1,
      perfStats: [Object],
      skipped: false,
      snapshot: [Object],
      sourceMaps: {},
      testResults: [
        {
          ancestorTitles: ['App'],
          duration: 4,
          failureMessages: [],
          fullName: 'App renders without crashing',
          location: null,
          numPassingAsserts: 0,
          status: 'passed',
          title: 'renders without crashing'
        },
        {
          ancestorTitles: ['App'],
          duration: 0,
          failureMessages: [],
          fullName: 'App renders without crashing with children',
          location: null,
          numPassingAsserts: 0,
          status: 'todo',
          title: 'renders without crashing with children'
        }
      ]
    }
  ],
  wasInterrupted: false
});
