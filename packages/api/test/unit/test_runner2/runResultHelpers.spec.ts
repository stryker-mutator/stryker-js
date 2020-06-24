import { expect } from 'chai';

import { toMutantRunResult, DryRunStatus, MutantRunResult, MutantRunStatus } from '../../../test_runner2';
import TestStatus from '../../../src/test_runner/TestStatus';

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
      const expected: MutantRunResult = { status: MutantRunStatus.Killed, failureMessage: 'expected foo to be bar', killedBy: '42' };
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
      const expected: MutantRunResult = { status: MutantRunStatus.Survived };
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
      const expected: MutantRunResult = { status: MutantRunStatus.Survived };
      expect(
        toMutantRunResult({
          status: DryRunStatus.Complete,
          tests: [],
        })
      ).deep.eq(expected);
    });
  });
});
