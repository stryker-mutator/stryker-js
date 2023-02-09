import chai, { expect } from 'chai';
import { ESLint } from 'eslint';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

import { CheckStatus } from '@stryker-mutator/api/check';

import { isFailedResult, makeResultFromLintReport } from '../../src/result-helpers.js';

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

  describe('makeResultFromLintReports', () => {
    function makeFakeLintResult(partial?: Partial<ESLint.LintResult>): ESLint.LintResult {
      return {
        errorCount: 0,
        ...partial,
      } as ESLint.LintResult;
    }

    it('should pass for a good report', async () => {
      const lintReports: ESLint.LintResult[] = [makeFakeLintResult()];
      const checkResult = await makeResultFromLintReport(lintReports, {} as ESLint.Formatter);
      expect(checkResult.status).to.equal(CheckStatus.Passed);
    });

    it('should be rejected and include all the messages for a bad report', async () => {
      const lintReports: ESLint.LintResult[] = [makeFakeLintResult({ errorCount: 1 })];
      const checkResult = await makeResultFromLintReport(lintReports, { format: () => '' });
      expect(checkResult.status).to.equal(CheckStatus.CompileError);
    });

    it('should use the formatter for the reason', async () => {
      const formatSpy = sinon.spy();
      const lintReports: ESLint.LintResult[] = [makeFakeLintResult({ errorCount: 1 })];
      await makeResultFromLintReport(lintReports, { format: formatSpy });
      expect(formatSpy).to.have.been.called;
    });

    it('should use the formatter for all failed results', async () => {
      const formatSpy = sinon.spy();
      const failures = [makeFakeLintResult({ errorCount: 1 }), makeFakeLintResult({ errorCount: 1 })];
      const lintReports: ESLint.LintResult[] = failures;
      await makeResultFromLintReport(lintReports, { format: formatSpy });
      expect(formatSpy).to.have.been.calledWith(failures);
    });

    it('should not use the formatter for any passed results', async () => {
      const formatSpy = sinon.spy();
      const failures = [makeFakeLintResult({ errorCount: 1 }), makeFakeLintResult({ errorCount: 1 })];
      const lintReports: ESLint.LintResult[] = [...failures, makeFakeLintResult({ errorCount: 0 })];
      await makeResultFromLintReport(lintReports, { format: formatSpy });
      expect(formatSpy).to.have.been.calledWith(failures);
    });
  });
});
