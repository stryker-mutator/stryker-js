import { schema } from '@stryker-mutator/api/core';

export interface MutationScoreOnlyReport {
  mutationScore: number;
}
export type Report = MutationScoreOnlyReport | schema.MutationTestResult;
