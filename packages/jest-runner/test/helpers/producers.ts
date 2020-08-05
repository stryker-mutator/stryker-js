import { TestResult, AggregatedResult, AssertionResult, SerializableError } from '@jest/test-result';

import { JestOptions } from '../../src-generated/jest-runner-options';

export const createJestOptions = (overrides?: Partial<JestOptions>): JestOptions => {
  return {
    enableFindRelatedTests: true,
    projectType: 'custom',
    ...overrides,
  };
};

export function createAssertionResult(overrides?: Partial<AssertionResult>): AssertionResult {
  return {
    ancestorTitles: [],
    failureMessages: [],
    fullName: 'foo should be bar',
    numPassingAsserts: 1,
    status: 'passed',
    title: 'should be bar',
    duration: 25,
    ...overrides,
  };
}

export function createJestAggregatedResult(overrides?: Partial<AggregatedResult>): AggregatedResult {
  return {
    numFailedTestSuites: 0,
    numFailedTests: 0,
    numPassedTestSuites: 0,
    numPassedTests: 0,
    numPendingTestSuites: 0,
    numPendingTests: 0,
    numRuntimeErrorTestSuites: 0,
    numTodoTests: 0,
    numTotalTestSuites: 0,
    numTotalTests: 0,
    openHandles: [],
    snapshot: {
      added: 0,
      didUpdate: false,
      failure: false,
      filesAdded: 0,
      filesRemoved: 0,
      filesRemovedList: [],
      filesUnmatched: 0,
      filesUpdated: 0,
      matched: 0,
      total: 0,
      unchecked: 0,
      uncheckedKeysByFile: [],
      unmatched: 0,
      updated: 0,
    },
    startTime: 0,
    success: true,
    testResults: [],
    wasInterrupted: false,
    ...overrides,
  };
}

export function createJestTestResult(overrides?: Partial<TestResult>): TestResult {
  return {
    leaks: false,
    numFailingTests: 0,
    numPassingTests: 0,
    numPendingTests: 0,
    numTodoTests: 0,
    openHandles: [],
    perfStats: {
      end: 0,
      start: 0,
    },
    skipped: false,
    snapshot: {
      added: 0,
      fileDeleted: false,
      matched: 0,
      unchecked: 0,
      uncheckedKeys: [],
      unmatched: 0,
      updated: 0,
    },
    testFilePath: '',
    testResults: [],
    ...overrides,
  };
}

export function createSerializableError(overrides?: Partial<SerializableError>): SerializableError {
  return {
    message: 'message',
    stack: 'stack',
    code: 'TEST',
    type: 'FooError',
    ...overrides,
  };
}

export const createFailResult = (): AggregatedResult =>
  createJestAggregatedResult({
    success: false,
    testResults: [
      createJestTestResult({
        testResults: [
          createAssertionResult({
            failureMessages: ['Fail message 1', 'Fail message 2'],
            fullName: 'App render renders without crashing',
            duration: 2,
            status: 'failed',
          }),
          createAssertionResult({
            duration: 0,
            failureMessages: ['Fail message 3', 'Fail message 4'],
            fullName: 'App render renders without crashing',
            status: 'failed',
          }),
        ],
      }),
      createJestTestResult({
        testResults: [
          {
            ancestorTitles: ['App'],
            duration: 23,
            failureMessages: [],
            fullName: 'App renders without crashing',
            numPassingAsserts: 0,
            status: 'passed',
            title: 'renders without crashing',
          },
        ],
      }),
    ],
  });

export const createSuccessResult = (): AggregatedResult =>
  createJestAggregatedResult({
    success: true,
    testResults: [
      createJestTestResult({
        testResults: [
          createAssertionResult({
            fullName: 'App renders without crashing',
            status: 'passed',
            duration: 23,
          }),
        ],
      }),
    ],
    wasInterrupted: false,
  });

export const createPendingResult = (): AggregatedResult =>
  createJestAggregatedResult({
    success: true,
    testResults: [
      createJestTestResult({
        testResults: [
          createAssertionResult({
            duration: 0,
            fullName: 'App renders without crashing',
            status: 'pending',
          }),
        ],
      }),
    ],
  });

export const createTodoResult = (): AggregatedResult =>
  createJestAggregatedResult({
    success: true,
    testResults: [
      createJestTestResult({
        skipped: false,
        testResults: [
          createAssertionResult({
            duration: 4,
            fullName: 'App renders without crashing',
            status: 'passed',
          }),
          createAssertionResult({
            duration: 0,
            fullName: 'App renders without crashing with children',
            status: 'todo',
          }),
        ],
      }),
    ],
  });
