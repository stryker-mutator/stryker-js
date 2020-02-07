import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';

import jest = require('jest');

import strykerJest from '../../typings/strykerJest';

import JestTestAdapter from './JestTestAdapter';

export default class JestPromiseTestAdapter implements JestTestAdapter {
  public static inject = tokens(commonTokens.logger);
  constructor(private readonly log: Logger) {}

  public run(jestConfig: strykerJest.Configuration, projectRoot: string, fileNameUnderTest?: string): Promise<strykerJest.RunResult> {
    jestConfig.reporters = [];
    const config = JSON.stringify(jestConfig);
    this.log.trace(`Invoking Jest with config ${config}`);
    if (fileNameUnderTest) {
      this.log.trace(`Only running tests related to ${fileNameUnderTest}`);
    }

    return (jest.runCLI(
      {
        $0: '',
        _: [],
        ...(fileNameUnderTest && { _: [fileNameUnderTest], findRelatedTests: true }),
        config,
        runInBand: true,
        silent: true
      },
      [projectRoot]
    ) as unknown) as Promise<strykerJest.RunResult>;
  }
}
