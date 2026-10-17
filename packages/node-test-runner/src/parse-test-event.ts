import path from 'node:path';

import { FILE_MARKER, toTestId } from './test-id.js';

export interface TestEvent {
  type: string;
  data: {
    name: string;
    message?: string;
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
  // node 22 omits `file` on a file's placeholder test, which is named after the file
  if (path.resolve(d.file ?? d.name) === path.resolve(setupFile)) {
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

// node:test emits a test's diagnostics right after its pass/fail event; ours is the first.
export function withMarkedFile(
  event: TestEvent,
  test: ReportedTest,
): ReportedTest | undefined {
  const message = event.data.message;
  if (event.type !== 'test:diagnostic' || !message?.startsWith(FILE_MARKER)) {
    return undefined;
  }
  const file = message.slice(FILE_MARKER.length);
  return { ...test, file, id: toTestId(file, test.name) };
}

// Mirrors the placeholder node:test reports for a test file that fails to load.
export function toLoadFailure(file: string, reason: unknown): ReportedTest {
  return {
    id: toTestId(file, file),
    name: file,
    file,
    status: 'fail',
    timeSpentMs: 0,
    failureMessage: reason instanceof Error ? reason.message : String(reason),
  };
}
