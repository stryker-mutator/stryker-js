import { MutantResult } from '@stryker-mutator/api/core';
import { MutationTestResult } from 'mutation-testing-report-schema';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type MutationServerMethods = {
  instrument(params: { globPatterns?: string[] }): MutationTestResult;
  mutate(params: { globPatterns?: string[] }): MutantResult[];
};
