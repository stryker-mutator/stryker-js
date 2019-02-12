import JestTestAdapter from './JestTestAdapter';
import { Logger } from '@stryker-mutator/api/logging';
import { Configuration, runCLI, RunResult } from 'jest';
import { tokens, commonTokens } from '@stryker-mutator/api/plugin';

export default class JestPromiseTestAdapter implements JestTestAdapter {

  public static inject = tokens(commonTokens.logger);
  constructor(private readonly log: Logger) {}

  public run(jestConfig: Configuration, projectRoot: string, fileNameUnderTest?: string): Promise<RunResult> {
    jestConfig.reporters = [];
    const config = JSON.stringify(jestConfig);
    this.log.trace(`Invoking Jest with config ${config}`);
    if (fileNameUnderTest) {
      this.log.trace(`Only running tests related to ${fileNameUnderTest}`);
    }

    return runCLI({
      ...(fileNameUnderTest && { _: [fileNameUnderTest], findRelatedTests: true}),
      config,
      runInBand: true,
      silent: true
    }, [projectRoot]);
  }
}
