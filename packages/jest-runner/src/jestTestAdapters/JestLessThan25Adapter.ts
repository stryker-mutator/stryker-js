import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import jest from 'jest';

import JestTestAdapter from './JestTestAdapter';

/**
 * The adapter used for 22 < Jest < 25.
 * It has a lot of `any` typings here, since the installed typings are not in sync.
 */
export default class JestLessThan25TestAdapter implements JestTestAdapter {
  public static inject = tokens(commonTokens.logger);
  constructor(private readonly log: Logger) {}

  public run(jestConfig: any, projectRoot: string, fileNameUnderTest?: string): Promise<any> {
    jestConfig.reporters = [];
    const config = JSON.stringify(jestConfig);
    this.log.trace(`Invoking Jest with config ${config}`);
    if (fileNameUnderTest) {
      this.log.trace(`Only running tests related to ${fileNameUnderTest}`);
    }

    return jest.runCLI(
      {
        ...(fileNameUnderTest && { _: [fileNameUnderTest], findRelatedTests: true }),
        config,
        runInBand: true,
        silent: true,
      } as any,
      [projectRoot]
    );
  }
}
