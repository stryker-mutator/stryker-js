import JestTestAdapter from './JestTestAdapter';
import { getLogger } from 'stryker-api/logging';
import { Configuration, runCLI, RunResult } from 'jest';

export default class JestPromiseTestAdapter implements JestTestAdapter {
  private readonly log = getLogger(JestPromiseTestAdapter.name);

  public run(jestConfig: Configuration, projectRoot: string, mutatedFileName?: string): Promise<RunResult> {
    jestConfig.reporters = [];
    const config = JSON.stringify(jestConfig);
    this.log.trace(`Invoking Jest with config ${config}`);
    if (mutatedFileName) {
      this.log.trace(`Only running tests related to ${mutatedFileName}`);
    }

    return runCLI({
      ...(mutatedFileName && { _: [mutatedFileName], findRelatedTests: true}),
      config,
      runInBand: true,
      silent: true
    }, [projectRoot]);
  }
}
