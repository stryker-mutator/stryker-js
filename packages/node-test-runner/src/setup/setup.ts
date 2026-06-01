// Loaded as the first file of every node:test run (with isolation:'none'), so
// this root-level beforeEach applies to the tests in every subsequently-loaded
// test file and runs *synchronously* before each test body. That lets Stryker's
// instrumented coverage counters attribute hits to the currently-running test.
//
// The worker stores the active Stryker namespace ('__stryker__' or '__stryker2__')
// on `globalThis.__STRYKER_NS__` before this module is imported.
import path from 'node:path';
import { afterEach, beforeEach } from 'node:test';

import { toTestId } from '../test-id.js';

const nsOf = (): { currentTestId?: string } => {
  const g = globalThis as Record<string, unknown>;
  const nsName = (g.__STRYKER_NS__ as string | undefined) ?? '__stryker__';
  return (g[nsName] ??= {}) as { currentTestId?: string };
};

beforeEach((t) => {
  const ns = nsOf();
  // `filePath` is available on the TestContext since Node 22.8; without it we
  // fall back to the bare name (coverage stays correct, ids are less unique).
  const filePath = (t as { filePath?: string }).filePath;
  const file = filePath
    ? path.relative(process.cwd(), filePath).split(path.sep).join('/')
    : '';
  ns.currentTestId = toTestId(file, t.name);
});

// Clear the id once the test ends so coverage from code that runs *between*
// tests (or after the last one) is attributed to `static` rather than
// mis-credited to the test that happened to run before it.
afterEach(() => {
  nsOf().currentTestId = undefined;
});
