import { expect } from 'chai';

import { CheckStatus } from '@stryker-mutator/api/check';

import { isFailedResult } from '../../src/result-helpers.js';

describe('eslint-checker unit tests', () => {
  describe('isFailedResult', () => {
    it('should return true for a failed result', () => {
      const result = isFailedResult({
        reason: 'because',
        status: CheckStatus.CompileError,
      });
      expect(result).to.be.true;
    });
  });
});
