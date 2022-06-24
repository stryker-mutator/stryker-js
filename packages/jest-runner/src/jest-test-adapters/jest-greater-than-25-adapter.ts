import { jestWrapper } from '../utils/index.js';
import { JestRunResult } from '../jest-run-result.js';

import { JestTestAdapter, RunSettings } from './jest-test-adapter.js';

export class JestGreaterThan25TestAdapter implements JestTestAdapter {
  public async run({ jestConfig, fileNamesUnderTest, testNamePattern, testLocationInResults }: RunSettings): Promise<JestRunResult> {
    const config = JSON.stringify(jestConfig);
    const result = await jestWrapper.runCLI(
      {
        $0: 'stryker',
        _: fileNamesUnderTest ? fileNamesUnderTest : [],
        findRelatedTests: !!fileNamesUnderTest,
        config,
        runInBand: true,
        silent: true,
        passWithNoTests: true,
        testNamePattern,
        testLocationInResults,
      },
      [jestConfig.rootDir ?? process.cwd()]
    );
    return result;
  }
}
