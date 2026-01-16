import type { Config } from '@jest/types';

import { JestRunResult } from '../jest-run-result.js';
import { pluginTokens } from '../plugin-di.js';
import { JestWrapper } from '../utils/jest-wrapper.js';

export interface RunSettings {
  jestConfig: Config.InitialOptions;
  testNamePattern?: string;
  fileNamesUnderTest?: string[];
  testFiles?: string[];
  testLocationInResults?: boolean;
}

export class JestTestAdapter {
  public static readonly inject = [pluginTokens.jestWrapper] as const;
  constructor(private readonly jestWrapper: JestWrapper) {}

  public async run({
    jestConfig,
    fileNamesUnderTest,
    testFiles,
    testNamePattern,
    testLocationInResults,
  }: RunSettings): Promise<JestRunResult> {
    const config = JSON.stringify(jestConfig);
    const testFilesToRun = testFiles ?? fileNamesUnderTest ?? [];
    const shouldFindRelatedTests = !testFiles && !!fileNamesUnderTest;
    const result = await this.jestWrapper.runCLI(
      {
        $0: 'stryker',
        _: testFilesToRun,
        findRelatedTests: shouldFindRelatedTests,
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
