import { TestResult, TestStatus } from '@stryker-mutator/api/test-runner';
import { TaskState, Test } from 'vitest';

function convertTaskStateToTestStatus(taskState: TaskState | undefined): TestStatus.Failed | TestStatus.Skipped | TestStatus.Success {
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
    id: test.id,
    name: test.name,
    timeSpentMs: test.result?.duration ?? 0,
    status: convertTaskStateToTestStatus(test.result?.state),
    failureMessage: test.result?.errors?.[0]?.message ?? '',
  };
}
