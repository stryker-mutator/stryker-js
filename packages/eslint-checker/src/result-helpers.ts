import { CheckResult, CheckStatus, FailedCheckResult } from '@stryker-mutator/api/check';
import { ESLint } from 'eslint';

export function isFailedResult(result: CheckResult): result is FailedCheckResult {
  return result.status === CheckStatus.CompileError;
}

export async function makeResultFromLintReport(reports: ESLint.LintResult[], formatter: ESLint.Formatter): Promise<CheckResult> {
  const failures = reports.filter((result) => result.errorCount > 0);

  if (failures.length > 0) {
    const reason = await formatter.format(failures);
    return {
      status: CheckStatus.CompileError,
      reason,
    };
  }

  return {
    status: CheckStatus.Passed,
  };
}
