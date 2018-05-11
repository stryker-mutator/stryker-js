import { getLogger } from 'log4js';

import JestTestAdapter from './JestTestAdapter';

export default class JestPromiseTestAdapter implements JestTestAdapter {
  private log = getLogger(JestPromiseTestAdapter.name);
  private testRunner: any;

  public constructor(loader?: NodeRequire) {
    loader = loader || /* istanbul ignore next */ require;

    this.testRunner = loader('jest');
  }

  public run(jestConfig: any, projectRoot: string): Promise<any> {
    jestConfig.reporters = [];
    const config = JSON.stringify(jestConfig);
    this.log.trace(`Invoking Jest with config ${config}`);

    return this.testRunner.runCLI({
      config: config,
      runInBand: true,
      silent: true
    }, [projectRoot]);
  }
}