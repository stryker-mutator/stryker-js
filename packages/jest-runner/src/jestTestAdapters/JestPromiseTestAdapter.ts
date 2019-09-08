import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import * as jest from 'jest';
import JestTestAdapter from './JestTestAdapter';

export default class JestPromiseTestAdapter implements JestTestAdapter {

  public static inject = tokens(commonTokens.logger);
  constructor(private readonly log: Logger) {}

  public run(jestConfig: JestStryker.Configuration, projectRoot: string, fileNameUnderTest?: string): Promise<JestStryker.RunResult> {
    jestConfig.reporters = [];
    const config = JSON.stringify(jestConfig);
    this.log.trace(`Invoking Jest with config ${config}`);
    if (fileNameUnderTest) {
      this.log.trace(`Only running tests related to ${fileNameUnderTest}`);
    }

    return jest.runCLI({
      ...(fileNameUnderTest && { _: [fileNameUnderTest], findRelatedTests: true, $0: ''}),
      config,
      runInBand: true,
      silent: true
    }, [projectRoot]) as any;
  }
}
