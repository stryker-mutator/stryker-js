import { CheckStatus } from './CheckStatus';

export interface CheckResult {
  reason?: string;
  status: CheckStatus;
}
