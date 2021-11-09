import { jestWrapper } from '../utils';
import { JestRunResult } from '../jest-run-result';

import { JestTestAdapter, RunSettings } from './jest-test-adapter';

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
        testNamePattern,
        testLocationInResults,
      },
      [jestConfig.rootDir ?? process.cwd()]
    );
    return result;
  }
}
