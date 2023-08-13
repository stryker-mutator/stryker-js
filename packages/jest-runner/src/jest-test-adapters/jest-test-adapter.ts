import type { Config } from '@jest/types';

import { JestRunResult } from '../jest-run-result.js';

export interface RunSettings {
  jestConfig: Config.InitialOptions;
  testNamePattern?: string;
  fileNamesUnderTest?: string[];
  testLocationInResults?: boolean;
}

export interface JestTestAdapter {
  run(settings: RunSettings): Promise<JestRunResult>;
}
