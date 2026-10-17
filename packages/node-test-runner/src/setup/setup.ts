import path from 'node:path';
import { afterEach, beforeEach } from 'node:test';

import { TEST_ID_MARKER, toTestId } from '../test-id.js';

const nsOf = (): { currentTestId?: string } => {
  const g = globalThis as Record<string, unknown>;
  const nsName = (g.__STRYKER_NS__ as string | undefined) ?? '__stryker__';
  return (g[nsName] ??= {});
};

beforeEach((t) => {
  // root before() fires before files import; beforeEach waits until all are loaded
  (
    globalThis as { __STRYKER_ACTIVATE__?: () => void }
  ).__STRYKER_ACTIVATE__?.();
  const ns = nsOf();
  const filePath = (t as { filePath?: string }).filePath;
  const file = filePath
    ? path.relative(process.cwd(), filePath).split(path.sep).join('/')
    : '';
  // fullName ("suite > test") keeps equally-named tests in different suites apart
  const id = toTestId(file, (t as { fullName?: string }).fullName ?? t.name);
  ns.currentTestId = id;
  // events report where test() was called, which differs when a helper declares it
  if ('diagnostic' in t) t.diagnostic(`${TEST_ID_MARKER}${id}`);
});

afterEach(() => {
  nsOf().currentTestId = undefined;
});
