import { appendFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { add } from '../math.js';

it('should add in file b', async () => {
  const start = Date.now();
  await new Promise((resolve) => setTimeout(resolve, 200));
  expect(add(40, 2)).toBe(42);
  appendFileSync(
    'test-runs.jsonl',
    JSON.stringify({ start, end: Date.now() }) + '\n',
  );
});
