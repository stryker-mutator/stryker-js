import { Config } from '@jest/types';

import { JestRunResult } from '../JestRunResult';

export interface JestTestAdapter {
  run(config: Config.InitialOptions, projectRoot: string, fileNameUnderTest?: string): Promise<JestRunResult>;
}
