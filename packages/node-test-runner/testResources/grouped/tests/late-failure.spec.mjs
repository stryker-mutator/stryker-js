import { test } from 'node:test';

// The test passes, but a timer it left behind throws after it ended. node:test
// only logs this as a diagnostic, yet still fails the run.
test('passes, then throws from a timer', () => {
  setTimeout(() => {
    throw new Error('late failure');
  }, 10);
});
