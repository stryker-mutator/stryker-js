import MutantStatus from '../report/MutantStatus';

export interface CheckResult {
  reason?: string;
  mutantResult: MutantStatus;
}
