import path from 'node:path';

import { toTestId } from './test-id.js';

/** The subset of a node:test reporter event that this runner reads. */
export interface TestEvent {
  type: string;
  data: {
    name: string;
    file?: string;
    details?: {
      // 'suite' for a `describe`/`it` block, 'test' for a `test()`/`it()`.
      type?: string;
      duration_ms?: number;
      // `failureType` is 'subtestsFailed' when this node only failed because a
      // descendant did; the real failure is reported separately by that leaf.
      error?: { message?: string; failureType?: string } | string;
    };
  };
}

/** A single test result, shaped for the IPC message back to the runner. */
export interface ReportedTest {
  id: string;
  name: string;
  file?: string;
  status: 'pass' | 'fail';
  timeSpentMs: number;
  failureMessage?: string;
}

/**
 * Turn one node:test reporter event into a {@link ReportedTest}, or `undefined`
 * when the event is not a real test result the runner should report:
 * - anything that is not a `test:pass`/`test:fail`;
 * - the setup file's own output;
 * - a `describe`/`it` *suite* container (`details.type === 'suite'`); and
 * - an ancestor whose only failure is a descendant's, which node:test bubbles up
 *   as a synthetic `subtestsFailed` failure (the leaf already reported itself).
 *
 * Dropping the containers keeps `nrOfTests` honest and stops `killedBy` from
 * collecting phantom container ids. A *passing* `test()` parent is
 * indistinguishable from a leaf in the event data (and may carry its own
 * assertions), so it is still reported.
 */
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
  const failed = event.type === 'test:fail';
  const failureMessage =
    typeof error === 'string' ? error : (error?.message ?? 'test failed');
  return {
    id: toTestId(file ?? '', d.name),
    name: d.name,
    file,
    status: failed ? 'fail' : 'pass',
    timeSpentMs: d.details?.duration_ms ?? 0,
    failureMessage: failed ? failureMessage : undefined,
  };
}
