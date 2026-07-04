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
  const filePath = (t as { filePath?: string }).filePath;
  const file = filePath
    ? path.relative(process.cwd(), filePath).split(path.sep).join('/')
    : '';
  ns.currentTestId = toTestId(file, t.name);
});

afterEach(() => {
  nsOf().currentTestId = undefined;
});
