import { TestResult, TestStatus } from '@stryker-mutator/api/test-runner';
import { RunMode, Suite, TaskState, Test, type ProjectConfig, ResolvedConfig } from 'vitest';

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
    name: collectTestName(test),
    timeSpentMs: test.result?.duration ?? 0,
    status: convertTaskStateToTestStatus(test.result?.state, test.mode),
    failureMessage: test.result?.errors?.[0]?.message ?? '',
  };
}

export function fromTestId(id: string): { file: string; name: string } {
  const [file, ...name] = id.split('#');
  return { file, name: name.join('#') };
}

export function collectTestsFromSuite(suite: Suite): Test[] {
  return suite.tasks.flatMap((task) => {
    if (task.type === 'suite') {
      return collectTestsFromSuite(task);
    } else if (task.type === 'test') {
      return task;
    } else {
      return [];
    }
  });
}

export function addToInlineDeps(config: ResolvedConfig, matcher: RegExp): void {
  switch (typeof config.deps?.inline) {
    case 'undefined':
      config.deps = { inline: [matcher] };
      break;
    case 'object':
      config.deps.inline.push(matcher);
      break;
    case 'boolean':
      if (!config.deps.inline) {
        config.deps.inline = [matcher];
      }
      break;
    default:
      config.deps.inline satisfies never;
  }
}

// Stryker disable all: the function toTestId will be stringified at runtime which will cause problems when mutated.

// Note: this function is used in code and copied to the mutated environment so the naming convention will always be the same.
// It can not use external resource because those will not be available in the mutated environment.
export function collectTestName({ name, suite }: { name: string; suite?: Suite }): string {
  const nameParts = [name];
  let currentSuite = suite;
  while (currentSuite) {
    nameParts.unshift(currentSuite.name);
    currentSuite = currentSuite.suite;
  }
  return nameParts.join(' ').trim();
}

export function toTestId(test: Test): string {
  return `${test.file?.filepath}#${collectTestName(test)}`;
}
// Stryker restore all
