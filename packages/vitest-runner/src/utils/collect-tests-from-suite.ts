import { Suite, Test } from 'vitest';

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
