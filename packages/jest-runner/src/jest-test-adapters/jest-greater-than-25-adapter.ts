import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';

import { Config } from '@jest/types';

import { jestWrapper } from '../utils/jest-wrapper';
import { JestRunResult } from '../jest-run-result';

import JestTestAdapter from './jest-test-adapter';

export default class JestGreaterThan25Adapter implements JestTestAdapter {
  public static inject = tokens(commonTokens.logger);
  constructor(private readonly log: Logger) {}

  public async run(jestConfig: Config.InitialOptions, projectRoot: string, fileNameUnderTest?: string): Promise<JestRunResult> {
    jestConfig.reporters = [];
    const config = JSON.stringify(jestConfig);
    this.log.trace(`Invoking Jest with config ${config}`);
    if (fileNameUnderTest) {
      this.log.trace(`Only running tests related to ${fileNameUnderTest}`);
    }
    const result = await jestWrapper.runCLI(
      {
        $0: 'stryker',
        _: fileNameUnderTest ? [fileNameUnderTest] : [],
        findRelatedTests: !!fileNameUnderTest,
        config,
        runInBand: true,
        silent: true,
      },
      [projectRoot]
    );
    return result;
  }
}
