import { JestRunResult } from '../jest-run-result.js';
import { JestWrapper } from '../utils/jest-wrapper.js';
import { pluginTokens } from '../plugin-di.js';

import { RunSettings, JestTestAdapter } from './jest-test-adapter.js';

/**
 * The adapter used for 22 < Jest < 25.
 * It has a lot of `any` typings here, since the installed typings are not in sync.
 */
export class JestLessThan25TestAdapter implements JestTestAdapter {
  public static readonly inject = [pluginTokens.jestWrapper] as const;
  constructor(private readonly jestWrapper: JestWrapper) {}

  public run({
    jestConfig,
    fileNamesUnderTest,
    testNamePattern,
    testLocationInResults,
  }: RunSettings): Promise<JestRunResult> {
    const config = JSON.stringify(jestConfig);
    return this.jestWrapper.runCLI(
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
      [jestConfig.rootDir ?? process.cwd()],
    );
  }
}
