import type { Config } from '@jest/types';
import type { AggregatedResult } from '@jest/test-result';

export interface JestRunResult {
  results: AggregatedResult;
  globalConfig: Config.GlobalConfig;
}
