import { MutantStatus } from './MutantStatus';

export interface CheckResult {
  reason?: string;
  result: MutantStatus;
}
