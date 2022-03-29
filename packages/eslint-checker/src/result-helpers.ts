import { CheckResult, CheckStatus, FailedCheckResult } from '@stryker-mutator/api/check';

export function isFailedResult(result: CheckResult): result is FailedCheckResult {
  return result.status === CheckStatus.CompileError;
}
