import { expect } from 'chai';

import { toReportedTest, type TestEvent } from '../../src/parse-test-event.js';
import { toTestId } from '../../src/test-id.js';

describe('toReportedTest', () => {
  const cwd = '/project';
  const setupFile = '/project/dist/src/setup/setup.js';

  function event(overrides: Partial<TestEvent['data']> & { type?: string }) {
    const { type = 'test:pass', ...data } = overrides;
    return {
      type,
      data: { name: 'a test', file: '/project/test/a.spec.mjs', ...data },
    } as TestEvent;
  }

  it('reports a passing test, file made cwd-relative with forward slashes', () => {
    const result = toReportedTest(event({ type: 'test:pass' }), cwd, setupFile);

    expect(result).deep.eq({
      id: toTestId('test/a.spec.mjs', 'a test'),
      name: 'a test',
      file: 'test/a.spec.mjs',
      status: 'pass',
      timeSpentMs: 0,
      failureMessage: undefined,
    });
  });

  it('uses the duration from the event when present', () => {
    const result = toReportedTest(
      event({ details: { duration_ms: 42 } }),
      cwd,
      setupFile,
    );

    expect(result?.timeSpentMs).eq(42);
  });

  it('reports a failing test with the error message', () => {
    const result = toReportedTest(
      event({ type: 'test:fail', details: { error: { message: 'boom' } } }),
      cwd,
      setupFile,
    );

    expect(result?.status).eq('fail');
    expect(result?.failureMessage).eq('boom');
  });

  it('uses a string error verbatim as the failure message', () => {
    const result = toReportedTest(
      event({ type: 'test:fail', details: { error: 'plain string error' } }),
      cwd,
      setupFile,
    );

    expect(result?.failureMessage).eq('plain string error');
  });

  it('falls back to a default message when a failure has no message', () => {
    const result = toReportedTest(
      event({ type: 'test:fail', details: {} }),
      cwd,
      setupFile,
    );

    expect(result?.failureMessage).eq('test failed');
  });

  it('does not attach a failure message to a passing test', () => {
    const result = toReportedTest(
      event({ type: 'test:pass', details: { error: { message: 'ignored' } } }),
      cwd,
      setupFile,
    );

    expect(result?.failureMessage).eq(undefined);
  });

  it('ignores non pass/fail events', () => {
    expect(toReportedTest(event({ type: 'test:start' }), cwd, setupFile)).eq(
      undefined,
    );
    expect(toReportedTest(event({ type: 'test:plan' }), cwd, setupFile)).eq(
      undefined,
    );
  });

  it("ignores the setup file's own events", () => {
    const result = toReportedTest(event({ file: setupFile }), cwd, setupFile);

    expect(result).eq(undefined);
  });

  it('drops describe/it suite containers', () => {
    const result = toReportedTest(
      event({ type: 'test:pass', details: { type: 'suite' } }),
      cwd,
      setupFile,
    );

    expect(result).eq(undefined);
  });

  it('drops a suite container even when it fails', () => {
    const result = toReportedTest(
      event({ type: 'test:fail', details: { type: 'suite' } }),
      cwd,
      setupFile,
    );

    expect(result).eq(undefined);
  });

  it('drops an ancestor whose only failure is a subtest (subtestsFailed)', () => {
    const result = toReportedTest(
      event({
        type: 'test:fail',
        details: { error: { failureType: 'subtestsFailed' } },
      }),
      cwd,
      setupFile,
    );

    expect(result).eq(undefined);
  });

  it('still reports a leaf that failed in its own code', () => {
    const result = toReportedTest(
      event({
        type: 'test:fail',
        details: { error: { message: 'x', failureType: 'testCodeFailure' } },
      }),
      cwd,
      setupFile,
    );

    expect(result?.status).eq('fail');
    expect(result?.failureMessage).eq('x');
  });

  it('reports a test with no file, using an empty file segment in the id', () => {
    const result = toReportedTest(event({ file: undefined }), cwd, setupFile);

    expect(result?.file).eq(undefined);
    expect(result?.id).eq(toTestId('', 'a test'));
  });

  it('reports a skipped test as skip, not pass', () => {
    const result = toReportedTest(
      event({ type: 'test:pass', skip: true }),
      cwd,
      setupFile,
    );

    expect(result?.status).eq('skip');
  });

  it('reports a skip with a reason string as skip', () => {
    const result = toReportedTest(
      event({ type: 'test:pass', skip: 'not on CI' }),
      cwd,
      setupFile,
    );

    expect(result?.status).eq('skip');
  });

  it('reports a todo test as skip', () => {
    const result = toReportedTest(
      event({ type: 'test:pass', todo: true }),
      cwd,
      setupFile,
    );

    expect(result?.status).eq('skip');
  });

  it('reports a FAILING todo as skip — node --test treats it as non-fatal', () => {
    const result = toReportedTest(
      event({
        type: 'test:fail',
        todo: true,
        details: { error: { message: 'not implemented yet' } },
      }),
      cwd,
      setupFile,
    );

    expect(result?.status).eq('skip');
    expect(result?.failureMessage).eq(undefined);
  });
});
