import { MutationLevel } from '@stryker-mutator/api/core';

export interface RunLevelOptions {
  runLevel?: MutationLevel;
}
export type MutationOperator = Record<string, { replacementOperator: any; mutatorName: string }>;
