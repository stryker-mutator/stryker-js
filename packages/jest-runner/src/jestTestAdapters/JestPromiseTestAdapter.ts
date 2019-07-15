import JestTestAdapter from './JestTestAdapter';
import { Logger } from '@stryker-mutator/api/logging';
import jest from 'jest';
import { tokens, COMMON_TOKENS } from '@stryker-mutator/api/plugin';

export default class JestPromiseTestAdapter implements JestTestAdapter {

  public static inject = tokens(COMMON_TOKENS.logger);
  constructor(private readonly log: Logger) {}

  public run(jestConfig: jest.Configuration, projectRoot: string, fileNameUnderTest?: string): Promise<jest.RunResult> {
    jestConfig.reporters = [];
    const config = JSON.stringify(jestConfig);
    this.log.trace(`Invoking Jest with config ${config}`);
    if (fileNameUnderTest) {
      this.log.trace(`Only running tests related to ${fileNameUnderTest}`);
    }

    return jest.runCLI({
      ...(fileNameUnderTest && { _: [fileNameUnderTest], findRelatedTests: true}),
      config,
      runInBand: true,
      silent: true
    }, [projectRoot]);
  }
}
