import { after, describe, it } from 'node:test';

// Every test passes, but the suite's own after() hook throws: the suite's
// `hookFailed` event is the only failure and must not be dropped.
describe('suite with failing hook', () => {
  after(() => {
    throw new Error('after hook failed');
  });
  it('passes', () => {});
});
