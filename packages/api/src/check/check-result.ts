import { CheckStatus } from './CheckStatus';

export interface FailedCheckResult {
  reason: string;
  status: CheckStatus.CompileError;
}

export interface PassedCheckResult {
  status: CheckStatus.Passed;
}

export type CheckResult = PassedCheckResult | FailedCheckResult;
