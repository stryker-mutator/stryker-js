import path from 'node:path';

import { toTestId } from './test-id.js';

export interface TestEvent {
  type: string;
  data: {
    name: string;
    file?: string;
    skip?: boolean | string;
    todo?: boolean | string;
    details?: {
      type?: string;
      duration_ms?: number;
      error?: { message?: string; failureType?: string } | string;
    };
  };
}

export interface ReportedTest {
  id: string;
  name: string;
  file?: string;
  status: 'pass' | 'fail' | 'skip';
  timeSpentMs: number;
  failureMessage?: string;
}

export function toReportedTest(
  event: TestEvent,
  cwd: string,
  setupFile: string,
): ReportedTest | undefined {
  if (event.type !== 'test:pass' && event.type !== 'test:fail') {
    return undefined;
  }
  const d = event.data;
  if (d.file && path.resolve(d.file) === path.resolve(setupFile)) {
    return undefined;
  }
  const error = d.details?.error;
  const failureType =
    typeof error === 'object' ? error?.failureType : undefined;
  if (d.details?.type === 'suite' || failureType === 'subtestsFailed') {
    return undefined;
  }
  const file = d.file
    ? path.relative(cwd, d.file).split(path.sep).join('/')
    : undefined;
  // skip/todo is never a failure: `node --test` exits 0 even for a failing todo
  const skipped = Boolean(d.skip) || Boolean(d.todo);
  const failed = !skipped && event.type === 'test:fail';
  const failureMessage =
    typeof error === 'string' ? error : (error?.message ?? 'test failed');
  return {
    id: toTestId(file ?? '', d.name),
    name: d.name,
    file,
    status: skipped ? 'skip' : failed ? 'fail' : 'pass',
    timeSpentMs: d.details?.duration_ms ?? 0,
    failureMessage: failed ? failureMessage : undefined,
  };
}
