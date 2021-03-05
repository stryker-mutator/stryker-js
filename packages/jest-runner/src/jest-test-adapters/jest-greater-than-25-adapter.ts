import { join } from 'path';

import { jestWrapper } from '../utils';
import { JestRunResult } from '../jest-run-result';

import { JestTestAdapter, RunSettings } from './jest-test-adapter';

export class JestGreaterThan25TestAdapter implements JestTestAdapter {
  public async run({ jestConfig, projectRoot, fileNameUnderTest, testNamePattern, jestConfigPath }: RunSettings): Promise<JestRunResult> {
    const config = jestConfigPath ? join(projectRoot, jestConfigPath) : JSON.stringify(jestConfig);

    const result = await jestWrapper.runCLI(
      {
        $0: 'stryker',
        _: fileNameUnderTest ? [fileNameUnderTest] : [],
        findRelatedTests: !!fileNameUnderTest,
        config,
        runInBand: true,
        silent: true,
        testNamePattern,
      },
      [projectRoot]
    );
    return result;
  }
}
