import { Config } from '@jest/types';

import { jestWrapper } from '../utils';
import { JestRunResult } from '../jest-run-result';

import { RunSettings, JestTestAdapter } from './jest-test-adapter';

/**
 * The adapter used for 22 < Jest < 25.
 * It has a lot of `any` typings here, since the installed typings are not in sync.
 */
export class JestLessThan25TestAdapter implements JestTestAdapter {
  public run({ jestConfig, projectRoot, fileNameUnderTest, testNamePattern, testLocationInResults }: RunSettings): Promise<JestRunResult> {
    const config = JSON.stringify(jestConfig);
    return jestWrapper.runCLI(
      {
        ...(fileNameUnderTest && { _: [fileNameUnderTest], findRelatedTests: true }),
        config,
        runInBand: true,
        silent: true,
        testNamePattern,
      } as Config.Argv,
      [projectRoot]
    );
  }
}
