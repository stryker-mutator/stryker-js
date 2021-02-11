import { CheckStatus } from './check-status';

export interface FailedCheckResult {
  reason: string;
  status: CheckStatus.CompileError;
}

export interface PassedCheckResult {
  status: CheckStatus.Passed;
}

export type CheckResult = FailedCheckResult | PassedCheckResult;
