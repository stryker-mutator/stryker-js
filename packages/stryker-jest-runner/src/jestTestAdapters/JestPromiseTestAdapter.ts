import JestTestAdapter from './JestTestAdapter';
import { getLogger } from 'stryker-api/logging';
import { Configuration, runCLI, RunResult } from 'jest';

export default class JestPromiseTestAdapter implements JestTestAdapter {
  private readonly log = getLogger(JestPromiseTestAdapter.name);

  public run(jestConfig: Configuration, projectRoot: string, fileName?: string): Promise<RunResult> {
    jestConfig.reporters = [];
    const config = JSON.stringify(jestConfig);
    this.log.trace(`Invoking jest with ${config}`);
    if (fileName) {
      this.log.trace(`Only running tests related to ${fileName}`);
    }

    return runCLI({
      ...(fileName && { _: [fileName]}),
      ...(fileName && { findRelatedTests: true }),
      config,
      runInBand: true,
      silent: true
    }, [projectRoot]);
  }
}
