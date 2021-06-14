import { Config } from '@jest/types';

import { JestRunResult } from '../jest-run-result';

export interface RunSettings {
  jestConfig: Config.InitialOptions;
  testNamePattern?: string;
  fileNameUnderTest?: string;
  testLocationInResults?: boolean;
}

export interface JestTestAdapter {
  run(settings: RunSettings): Promise<JestRunResult>;
}
