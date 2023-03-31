import { TestResult, TestStatus } from '@stryker-mutator/api/test-runner';
import { RunMode, TaskState, Test } from 'vitest';

import { toTestId } from './collect-test-name.js';

function convertTaskStateToTestStatus(taskState: TaskState | undefined, testMode: RunMode): TestStatus {
  if (testMode === 'skip') {
    return TestStatus.Skipped;
  }
  if (taskState) {
    switch (taskState) {
      case 'pass': {
        return TestStatus.Success;
      }
      case 'fail': {
        return TestStatus.Failed;
      }
      case 'skip':
      case 'todo': {
        return TestStatus.Skipped;
      }
      default: {
        return TestStatus.Failed;
      }
    }
  }
  return TestStatus.Failed;
}

export function convertTestToTestResult(test: Test): TestResult {
  return {
    id: toTestId(test),
    name: test.name,
    timeSpentMs: test.result?.duration ?? 0,
    status: convertTaskStateToTestStatus(test.result?.state, test.mode),
    failureMessage: test.result?.errors?.[0]?.message ?? '',
  };
}

export function fromTestId(id: string): { file: string; name: string } {
  const [file, ...name] = id.split('#');
  return { file, name: name.join('#') };
}
