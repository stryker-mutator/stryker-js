import fs from 'fs/promises';

import { beforeEach, afterAll, beforeAll } from 'vitest';

import { toTestId } from '../utils/collect-test-name.js';
import { setupFiles } from '../vitest-file-communication.js';

beforeEach(async (a) => {
  const context = globalThis[globalThis.strykerGlobalNamespaceName] ?? (globalThis[globalThis.strykerGlobalNamespaceName] = {});
  context.currentTestId = toTestId(a.meta);
});

afterAll(async () => {
  if (globalThis.strykerDryRun) {
    await fs.writeFile(setupFiles.coverageFile, JSON.stringify(globalThis[globalThis.strykerGlobalNamespaceName]?.mutantCoverage));
  } else {
    await fs.writeFile(setupFiles.hitCountFile, JSON.stringify(globalThis[globalThis.strykerGlobalNamespaceName]?.hitCount));
  }
});

beforeAll(() => {
  const context = globalThis[globalThis.strykerGlobalNamespaceName] ?? (globalThis[globalThis.strykerGlobalNamespaceName] = {});
  context.hitCount = 0;
});
