import { join } from 'path';

import jest from 'jest';

import { JestRunResult } from '../jest-run-result';

import { RunSettings, JestTestAdapter } from './jest-test-adapter';

/**
 * The adapter used for 22 < Jest < 25.
 * It has a lot of `any` typings here, since the installed typings are not in sync.
 */
export class JestLessThan25TestAdapter implements JestTestAdapter {
  public run({ jestConfig, projectRoot, fileNameUnderTest, testNamePattern, jestConfigPath }: RunSettings): Promise<JestRunResult> {
    const config = jestConfigPath ? join(projectRoot, jestConfigPath) : JSON.stringify(jestConfig);
    return jest.runCLI(
      {
        ...(fileNameUnderTest && { _: [fileNameUnderTest], findRelatedTests: true }),
        config,
        runInBand: true,
        silent: true,
        testNamePattern,
      } as any,
      [projectRoot]
    );
  }
}
