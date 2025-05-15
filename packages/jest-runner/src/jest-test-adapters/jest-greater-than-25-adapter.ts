import { JestRunResult } from '../jest-run-result.js';
import { pluginTokens } from '../plugin-di.js';
import { JestWrapper } from '../utils/jest-wrapper.js';

import { JestTestAdapter, RunSettings } from './jest-test-adapter.js';

export class JestGreaterThan25TestAdapter implements JestTestAdapter {
  public static readonly inject = [pluginTokens.jestWrapper] as const;
  constructor(private readonly jestWrapper: JestWrapper) {}

  public async run({
    jestConfig,
    fileNamesUnderTest,
    testNamePattern,
    testLocationInResults,
  }: RunSettings): Promise<JestRunResult> {
    const config = JSON.stringify(jestConfig);
    const result = await this.jestWrapper.runCLI(
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
      [jestConfig.rootDir ?? process.cwd()],
    );
    return result;
  }
}
