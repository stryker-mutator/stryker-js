import test from 'node:test';
import assert from 'node:assert/strict';

// A test's own IPC traffic must not end the run early.
test('sends a message, then fails', async () => {
  process.send?.({ type: 'ready' });
  await new Promise((resolve) => setTimeout(resolve, 50));
  assert.fail('failed after the message');
});
