import { expect } from 'chai';

import {
  TestStatus,
  toMutantRunResult,
  DryRunStatus,
  MutantRunResult,
  MutantRunStatus,
  determineHitLimitReached,
  TimeoutDryRunResult,
} from '../../../src/test-runner/index.js';

describe('runResultHelpers', () => {
  describe(determineHitLimitReached.name, () => {
    it('should determine a timeout result when hit count is higher than limit', () => {
      const expected: TimeoutDryRunResult = { status: DryRunStatus.Timeout, reason: 'Hit limit reached (10/9)' };
      const actual = determineHitLimitReached(10, 9);
      expect(actual).deep.eq(expected);
    });
    it('should not determine a timeout result when hit count is less than or equal to limit', () => {
      const actual = determineHitLimitReached(10, 10);
      expect(actual).undefined;
    });
  });

  describe(toMutantRunResult.name, () => {
    it('should convert "timeout" to "timeout"', () => {
      const expected: MutantRunResult = { status: MutantRunStatus.Timeout, reason: 'timeout reason' };
      const actual = toMutantRunResult({ status: DryRunStatus.Timeout, reason: 'timeout reason' });
      expect(actual).deep.eq(expected);
    });

    it('should convert "error" to "error"', () => {
      const expected: MutantRunResult = { status: MutantRunStatus.Error, errorMessage: 'some error' };
      const actual = toMutantRunResult({ status: DryRunStatus.Error, errorMessage: 'some error' });
      expect(actual).deep.eq(expected);
    });

    it('should report all failed tests as "killed" when given the option', () => {
      const expected: MutantRunResult = {
        status: MutantRunStatus.Killed,
        failureMessage: 'expected foo to be bar',
        killedBy: ['42', '43'],
        nrOfTests: 4,
      };
      const actual = toMutantRunResult(
        {
          status: DryRunStatus.Complete,
          tests: [
            { status: TestStatus.Success, id: 'success1', name: 'success1', timeSpentMs: 42 },
            { status: TestStatus.Failed, id: '42', name: 'error', timeSpentMs: 42, failureMessage: 'expected foo to be bar' },
            { status: TestStatus.Failed, id: '43', name: 'error', timeSpentMs: 42, failureMessage: 'expected this to be that' },
            { status: TestStatus.Success, id: 'success2', name: 'success2', timeSpentMs: 42 },
          ],
        },
        true
      );
      expect(actual).deep.eq(expected);
    });

    it('should report a single tests as "killed" by default', () => {
      const expected: MutantRunResult = {
        status: MutantRunStatus.Killed,
        failureMessage: 'expected foo to be bar',
        killedBy: '42',
        nrOfTests: 4,
      };
      const actual = toMutantRunResult({
        status: DryRunStatus.Complete,
        tests: [
          { status: TestStatus.Success, id: 'success1', name: 'success1', timeSpentMs: 42 },
          { status: TestStatus.Failed, id: '42', name: 'error', timeSpentMs: 42, failureMessage: 'expected foo to be bar' },
          { status: TestStatus.Failed, id: '43', name: 'error', timeSpentMs: 42, failureMessage: 'expected this to be that' },
          { status: TestStatus.Success, id: 'success2', name: 'success2', timeSpentMs: 42 },
        ],
      });
      expect(actual).deep.eq(expected);
    });

    it('should report only succeeded tests as "survived"', () => {
      const expected: MutantRunResult = { status: MutantRunStatus.Survived, nrOfTests: 3 };
      const actual = toMutantRunResult({
        status: DryRunStatus.Complete,
        tests: [
          { status: TestStatus.Success, id: 'success1', name: 'success1', timeSpentMs: 42 },
          { status: TestStatus.Success, id: '42', name: 'error', timeSpentMs: 42 },
          { status: TestStatus.Success, id: 'success2', name: 'success2', timeSpentMs: 42 },
        ],
      });
      expect(actual).deep.eq(expected);
    });

    it('should report an empty suite as "survived"', () => {
      const expected: MutantRunResult = { status: MutantRunStatus.Survived, nrOfTests: 0 };
      const actual = toMutantRunResult({
        status: DryRunStatus.Complete,
        tests: [],
      });
      expect(actual).deep.eq(expected);
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
