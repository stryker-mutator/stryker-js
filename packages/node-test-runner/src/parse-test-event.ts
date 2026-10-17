import path from 'node:path';

import {
  fileOfTestId,
  nameOfTestId,
  TEST_ID_MARKER,
  toTestId,
} from './test-id.js';

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
  // drop containers, but keep a suite that failed itself (e.g. a failing after() hook)
  const isSuite = d.details?.type === 'suite';
  if (
    failureType === 'subtestsFailed' ||
    (isSuite && event.type === 'test:pass')
  ) {
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
  if (
    event.type !== 'test:diagnostic' ||
    !message?.startsWith(TEST_ID_MARKER)
  ) {
    return undefined;
  }
  const id = message.slice(TEST_ID_MARKER.length);
  return { ...test, id, name: nameOfTestId(id), file: fileOfTestId(id) };
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

const LATE_FAILURE_ID = '__stryker__late-failure';

// node:test only logs errors thrown after a test ended (e.g. from a stray timer) as
// diagnostics, but still fails the run, so surface them as a failing test.
export function toLateFailure(messages: string[]): ReportedTest {
  return {
    id: LATE_FAILURE_ID,
    name: 'asynchronous activity after the tests ended',
    status: 'fail',
    timeSpentMs: 0,
    failureMessage: messages.length
      ? messages.join('\n')
      : 'node:test reported a failure outside of any test',
  };
}
