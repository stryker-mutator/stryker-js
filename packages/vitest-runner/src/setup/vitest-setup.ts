import fs from 'fs/promises';

import { beforeEach, afterAll, beforeAll } from 'vitest';

import { collectTestName } from '../utils/collect-test-name.js';

beforeEach(async (a) => {
  const context = globalThis[globalThis.strykerGlobalNamespaceName] ?? (globalThis[globalThis.strykerGlobalNamespaceName] = {});
  context.currentTestId = collectTestName(a.meta);
});

afterAll(async () => {
  if (globalThis.strykerDryRun) {
    await fs.writeFile(new URL('__stryker__.json', import.meta.url), JSON.stringify(globalThis[globalThis.strykerGlobalNamespaceName]));
  } else {
    await fs.writeFile(new URL('__stryker__.json', import.meta.url), JSON.stringify(globalThis[globalThis.strykerGlobalNamespaceName]?.hitCount));
  }
});

beforeAll(() => {
  const context = globalThis[globalThis.strykerGlobalNamespaceName] ?? (globalThis[globalThis.strykerGlobalNamespaceName] = {});
  context.hitCount = 0;
});
