import { Config } from '@jest/types';

import { JestRunResult } from '../jest-run-result';

export default interface JestTestAdapter {
  run(config: Config.InitialOptions, projectRoot: string, fileNameUnderTest?: string): Promise<JestRunResult>;
}
