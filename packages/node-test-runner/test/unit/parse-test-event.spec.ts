import { expect } from 'chai';

import {
  toLateFailure,
  toReportedTest,
  withMarkedFile,
  type ReportedTest,
  type TestEvent,
} from '../../src/parse-test-event.js';
import { TEST_ID_MARKER, toTestId } from '../../src/test-id.js';

describe('toReportedTest', () => {
  const cwd = '/project';

  function event(overrides: Partial<TestEvent['data']> & { type?: string }) {
    const { type = 'test:pass', ...data } = overrides;
    return {
      type,
      data: { name: 'a test', file: '/project/test/a.spec.mjs', ...data },
    } as TestEvent;
  }

  it('reports a passing test, file made cwd-relative with forward slashes', () => {
    const result = toReportedTest(event({ type: 'test:pass' }), cwd);

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
    const result = toReportedTest(event({ details: { duration_ms: 42 } }), cwd);

    expect(result?.timeSpentMs).eq(42);
  });

  it('reports a failing test with the error message', () => {
    const result = toReportedTest(
      event({ type: 'test:fail', details: { error: { message: 'boom' } } }),
      cwd,
    );

    expect(result?.status).eq('fail');
    expect(result?.failureMessage).eq('boom');
  });

  it('uses a string error verbatim as the failure message', () => {
    const result = toReportedTest(
      event({ type: 'test:fail', details: { error: 'plain string error' } }),
      cwd,
    );

    expect(result?.failureMessage).eq('plain string error');
  });

  it('falls back to a default message when a failure has no message', () => {
    const result = toReportedTest(
      event({ type: 'test:fail', details: {} }),
      cwd,
    );

    expect(result?.failureMessage).eq('test failed');
  });

  it('does not attach a failure message to a passing test', () => {
    const result = toReportedTest(
      event({ type: 'test:pass', details: { error: { message: 'ignored' } } }),
      cwd,
    );

    expect(result?.failureMessage).eq(undefined);
  });

  it('ignores non pass/fail events', () => {
    expect(toReportedTest(event({ type: 'test:start' }), cwd)).eq(undefined);
    expect(toReportedTest(event({ type: 'test:plan' }), cwd)).eq(undefined);
  });

  it('drops describe/it suite containers', () => {
    const result = toReportedTest(
      event({ type: 'test:pass', details: { type: 'suite' } }),
      cwd,
    );

    expect(result).eq(undefined);
  });

  it('drops a suite container that only failed because of a subtest', () => {
    const result = toReportedTest(
      event({
        type: 'test:fail',
        details: { type: 'suite', error: { failureType: 'subtestsFailed' } },
      }),
      cwd,
    );

    expect(result).eq(undefined);
  });

  it('reports a suite that failed itself, e.g. in an after() hook', () => {
    const result = toReportedTest(
      event({
        type: 'test:fail',
        details: {
          type: 'suite',
          error: { message: 'after boom', failureType: 'hookFailed' },
        },
      }),
      cwd,
    );

    expect(result?.status).eq('fail');
    expect(result?.failureMessage).eq('after boom');
  });

  it('drops an ancestor whose only failure is a subtest (subtestsFailed)', () => {
    const result = toReportedTest(
      event({
        type: 'test:fail',
        details: { error: { failureType: 'subtestsFailed' } },
      }),
      cwd,
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
    );

    expect(result?.status).eq('fail');
    expect(result?.failureMessage).eq('x');
  });

  it('reports a test with no file, using an empty file segment in the id', () => {
    const result = toReportedTest(event({ file: undefined }), cwd);

    expect(result?.file).eq(undefined);
    expect(result?.id).eq(toTestId('', 'a test'));
  });

  it('reports a skipped test as skip, not pass', () => {
    const result = toReportedTest(
      event({ type: 'test:pass', skip: true }),
      cwd,
    );

    expect(result?.status).eq('skip');
  });

  it('reports a skip with a reason string as skip', () => {
    const result = toReportedTest(
      event({ type: 'test:pass', skip: 'not on CI' }),
      cwd,
    );

    expect(result?.status).eq('skip');
  });

  it('reports a todo test as skip', () => {
    const result = toReportedTest(
      event({ type: 'test:pass', todo: true }),
      cwd,
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
    );

    expect(result?.status).eq('skip');
    expect(result?.failureMessage).eq(undefined);
  });
});

describe('withMarkedFile', () => {
  const test: ReportedTest = {
    id: toTestId('test/helper.mjs', 'works'),
    name: 'works',
    file: 'test/helper.mjs',
    status: 'pass',
    timeSpentMs: 1,
  };

  it("takes the id, full name and file from the setup hook's marker", () => {
    const id = toTestId('test/a.spec.mjs', 'suite > works');
    const result = withMarkedFile(
      {
        type: 'test:diagnostic',
        data: { name: '', message: `${TEST_ID_MARKER}${id}` },
      },
      test,
    );
    expect(result).deep.eq({
      ...test,
      id,
      name: 'suite > works',
      file: 'test/a.spec.mjs',
    });
  });

  it('ignores a diagnostic that is not a marker', () => {
    const result = withMarkedFile(
      { type: 'test:diagnostic', data: { name: '', message: 'tests 1' } },
      test,
    );
    expect(result).undefined;
  });
});

describe('toLateFailure', () => {
  it('reports the late errors as one failing test', () => {
    const result = toLateFailure(['Error: first', 'Error: second']);
    expect(result).deep.include({
      status: 'fail',
      failureMessage: 'Error: first\nError: second',
    });
  });

  it('falls back to a generic message without late errors', () => {
    expect(toLateFailure([]).failureMessage).eq(
      'node:test reported a failure outside of any test',
    );
  });
});
