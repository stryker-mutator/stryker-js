import test from 'node:test';

test('a slow test that should be timed out', async () => {
  await new Promise((resolve) => setTimeout(resolve, 5000));
});
