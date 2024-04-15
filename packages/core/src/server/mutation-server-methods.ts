import { MutantResult } from '@stryker-mutator/api/core';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type MutationServerMethods = {
  instrument(params: { globPatterns?: string[] }): Promise<MutantResult[]>;
  mutate(params: { globPatterns?: string[] }): Promise<MutantResult[]>;
};
