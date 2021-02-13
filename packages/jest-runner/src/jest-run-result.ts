import type { AggregatedResult } from '@jest/test-result';
import type { Config } from '@jest/types';

export interface JestRunResult {
  results: AggregatedResult;
  globalConfig: Config.GlobalConfig;
}
