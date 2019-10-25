import { mutationTestReportSchema } from '@stryker-mutator/api/report';

export interface Report {
  result?: mutationTestReportSchema.MutationTestResult;
  mutationScore?: number;
}
