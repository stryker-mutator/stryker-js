import { mutationTestReportSchema } from '@stryker-mutator/api/report';

export interface MutationScoreOnlyReport {
  mutationScore: number;
}
export type Report = mutationTestReportSchema.MutationTestResult | MutationScoreOnlyReport;
