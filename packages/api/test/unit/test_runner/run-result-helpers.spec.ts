import { expect } from 'chai';

import { DryRunStatus, MutantRunResult, MutantRunStatus, TestStatus, toMutantRunResult } from '../../../src/test-runner';

describe('runResultHelpers', () => {
  describe(toMutantRunResult.name, () => {
    it('should convert "timeout" to "timeout"', () => {
      const expected: MutantRunResult = { status: MutantRunStatus.Timeout };
      expect(toMutantRunResult({ status: DryRunStatus.Timeout })).deep.eq(expected);
    });

    it('should convert "error" to "error"', () => {
      const expected: MutantRunResult = { status: MutantRunStatus.Error, errorMessage: 'some error' };
      expect(toMutantRunResult({ status: DryRunStatus.Error, errorMessage: 'some error' })).deep.eq(expected);
    });

    it('should report a failed test as "killed"', () => {
      const expected: MutantRunResult = { status: MutantRunStatus.Killed, failureMessage: 'expected foo to be bar', killedBy: '42', nrOfTests: 3 };
      expect(
        toMutantRunResult({
          status: DryRunStatus.Complete,
          tests: [
            { status: TestStatus.Success, id: 'success1', name: 'success1', timeSpentMs: 42 },
            { status: TestStatus.Failed, id: '42', name: 'error', timeSpentMs: 42, failureMessage: 'expected foo to be bar' },
            { status: TestStatus.Success, id: 'success2', name: 'success2', timeSpentMs: 42 },
          ],
        })
      ).deep.eq(expected);
    });

    it('should report only succeeded tests as "survived"', () => {
      const expected: MutantRunResult = { status: MutantRunStatus.Survived, nrOfTests: 3 };
      expect(
        toMutantRunResult({
          status: DryRunStatus.Complete,
          tests: [
            { status: TestStatus.Success, id: 'success1', name: 'success1', timeSpentMs: 42 },
            { status: TestStatus.Success, id: '42', name: 'error', timeSpentMs: 42 },
            { status: TestStatus.Success, id: 'success2', name: 'success2', timeSpentMs: 42 },
          ],
        })
      ).deep.eq(expected);
    });

    it('should report an empty suite as "survived"', () => {
      const expected: MutantRunResult = { status: MutantRunStatus.Survived, nrOfTests: 0 };
      expect(
        toMutantRunResult({
          status: DryRunStatus.Complete,
          tests: [],
        })
      ).deep.eq(expected);
    });

    it("should set nrOfTests with the amount of tests that weren't `skipped`", () => {
      const expected: MutantRunResult = { nrOfTests: 2, failureMessage: '', killedBy: '1', status: MutantRunStatus.Killed };
      const actual = toMutantRunResult({
        status: DryRunStatus.Complete,
        tests: [
          { id: '1', name: '', status: TestStatus.Failed, timeSpentMs: 42, failureMessage: '' },
          { id: '1', name: '', status: TestStatus.Skipped, timeSpentMs: 42 },
          { id: '1', name: '', status: TestStatus.Success, timeSpentMs: 42 },
        ],
      });
      expect(actual).deep.eq(expected);
    });
  });
});
