import fs from 'fs/promises';

import { beforeEach, afterAll } from 'vitest';

import { collectTestName } from '../utils/collect-test-name.js';

beforeEach(async (a) => {
  console.log(a.meta.name);
  const context = globalThis[globalThis.strykerGlobalNamespaceName] ?? (globalThis[globalThis.strykerGlobalNamespaceName] = {});
  context.currentTestId = collectTestName(a.meta);
});

afterAll(async () => {
  if (globalThis.strykerDryRun) {
    await fs.writeFile(new URL('__stryker__.json', import.meta.url), JSON.stringify(globalThis.__stryker2__));
  }
});
