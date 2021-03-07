import { join } from 'path';
import { promises as fs } from 'fs';

import jest from 'jest';

import { JestRunResult } from '../jest-run-result';

import { RunSettings, JestTestAdapter } from './jest-test-adapter';

/**
 * The adapter used for 22 < Jest < 25.
 * It has a lot of `any` typings here, since the installed typings are not in sync.
 */
export class JestLessThan25TestAdapter implements JestTestAdapter {
  public async run({ jestConfig, projectRoot, fileNameUnderTest, testNamePattern, jestConfigPath }: RunSettings): Promise<JestRunResult> {
    const config = JSON.stringify(jestConfig);
    const mutatedConfigPath = jestConfigPath ? join(projectRoot, jestConfigPath + '.stryker-jest-config.json') : '';
    if (mutatedConfigPath) await fs.writeFile(mutatedConfigPath, config, { flag: 'w+' });

    return jest.runCLI(
      {
        ...(fileNameUnderTest && { _: [fileNameUnderTest], findRelatedTests: true }),
        config: mutatedConfigPath || config,
        runInBand: true,
        silent: true,
        testNamePattern,
        rootDir: projectRoot,
      } as any,
      [projectRoot]
    );
  }
}
