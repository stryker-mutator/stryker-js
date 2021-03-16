import { Config } from '@jest/types';

import { JestRunResult } from '../jest-run-result';

export interface RunSettings {
  jestConfig: Config.InitialOptions;
  projectRoot: string;
  testNamePattern?: string;
  fileNameUnderTest?: string;
}

export interface JestTestAdapter {
  run(settings: RunSettings): Promise<JestRunResult>;
}
