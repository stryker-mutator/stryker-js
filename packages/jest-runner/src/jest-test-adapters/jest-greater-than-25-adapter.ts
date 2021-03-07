import { join } from 'path';
import { promises as fs } from 'fs';

import { jestWrapper } from '../utils';
import { JestRunResult } from '../jest-run-result';

import { JestTestAdapter, RunSettings } from './jest-test-adapter';

export class JestGreaterThan25TestAdapter implements JestTestAdapter {
  public async run({ jestConfig, projectRoot, fileNameUnderTest, testNamePattern, jestConfigPath }: RunSettings): Promise<JestRunResult> {
    const config = JSON.stringify(jestConfig);
    const mutatedConfigPath = jestConfigPath ? join(projectRoot, jestConfigPath + '.stryker-jest-config.json') : '';
    if (mutatedConfigPath) await fs.writeFile(mutatedConfigPath, config, { flag: 'w+' });
    const rootDir = jestConfig.rootDir ?? projectRoot;

    const result = await jestWrapper.runCLI(
      {
        $0: 'stryker',
        _: fileNameUnderTest ? [fileNameUnderTest] : [],
        findRelatedTests: !!fileNameUnderTest,
        config: mutatedConfigPath || config,
        runInBand: true,
        silent: true,
        testNamePattern,
        rootDir,
      },
      [projectRoot]
    );
    return result;
  }
}
