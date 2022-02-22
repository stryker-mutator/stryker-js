import type { TestResult, AggregatedResult, AssertionResult, SerializableError } from '@jest/test-result';
import type { EnvironmentContext } from '@jest/environment';
import { Circus, Config } from '@jest/types';
import { factory } from '@stryker-mutator/test-helpers';

import { JestOptions } from '../../src-generated/jest-runner-options';
import { JestRunResult } from '../../src/jest-run-result';
import { JestRunnerOptionsWithStrykerOptions } from '../../src/jest-runner-options-with-stryker-options';

export const createJestRunnerOptionsWithStrykerOptions = (overrides?: Partial<JestOptions>): JestRunnerOptionsWithStrykerOptions => {
  return factory.strykerWithPluginOptions({ jest: createJestOptions(overrides) });
};

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
    failureDetails: [],
    ...overrides,
  };
}

export function createJestRunResult(overrides?: Partial<JestRunResult>): JestRunResult {
  return {
    globalConfig: createGlobalConfig(),
    results: createJestAggregatedResult(),
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
      runtime: 0,
      slow: false,
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
  } as TestResult; // Do this cast to prevent breaking builds when unused options are added
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
        testFilePath: 'qux.js',
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
        testFilePath: 'quux.js',
        testResults: [
          createAssertionResult({
            ancestorTitles: ['App'],
            duration: 23,
            location: { line: 42, column: 43 },
            failureMessages: [],
            fullName: 'App renders without crashing',
            numPassingAsserts: 0,
            status: 'passed',
            title: 'renders without crashing',
          }),
        ],
      }),
    ],
  });

export const createGlobalConfig = (): Config.GlobalConfig =>
  ({
    bail: 1,
    changedFilesWithAncestor: true,
    collectCoverage: false,
  } as Config.GlobalConfig); // Do this cast to prevent breaking builds when unused options are added

export const createEnvironmentContext = (overrides?: Partial<EnvironmentContext>): EnvironmentContext =>
  ({
    testPath: 'foo.js',
    ...overrides,
  } as EnvironmentContext); // Do this cast to prevent breaking builds when unused options are added

export const createProjectConfig = (): Config.ProjectConfig =>
  ({
    detectLeaks: true,
  } as Config.ProjectConfig); // Do this cast to prevent breaking builds when unused options are added

export const createCircusDescribeBlock = (overrides?: Partial<Circus.DescribeBlock>): Circus.DescribeBlock =>
  ({
    name: 'ROOT_SUITE',
    ...overrides,
  } as Circus.DescribeBlock); // Do this cast to prevent breaking builds when unused options are added

export const createCircusTestEntry = (overrides?: Partial<Circus.TestEntry>): Circus.TestEntry =>
  ({
    name: 'should be bar',
    parent: createCircusDescribeBlock({ name: 'foo', parent: createCircusDescribeBlock() }),
    ...overrides,
  } as Circus.TestEntry); // Do this casts to prevent breaking builds when unused options are added

export const createCircusTestStartEvent = (test = createCircusTestEntry()): Circus.Event => ({
  name: 'test_start',
  test,
});
export const createCircusTestDoneEvent = (test = createCircusTestEntry()): Circus.Event => ({
  name: 'test_done',
  test,
});
export const createCircusRunStartEvent = (): Circus.AsyncEvent => ({
  name: 'run_start',
});

export const createCircusState = (): Circus.State =>
  ({
    hasFocusedTests: false,
  } as Circus.State); // Do this casts to prevent breaking builds when unused options are added

export const createSuccessResult = (): AggregatedResult =>
  createJestAggregatedResult({
    success: true,
    testResults: [
      createJestTestResult({
        testFilePath: 'foo.js',
        testResults: [
          createAssertionResult({
            fullName: 'App renders without crashing',
            status: 'passed',
            location: { column: 4, line: 3 },
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
        testFilePath: 'bar.js',
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
        testFilePath: 'baz.js',
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
