import JestTestAdapter from './JestTestAdapter';

export default class JestPromiseTestAdapter implements JestTestAdapter {
  private testRunner: any;

  public constructor(loader?: NodeRequire) {
    loader = loader || /* istanbul ignore next */ require;

    this.testRunner = loader('jest');
  }

  public run(jestConfig: any, projectRoot: string): Promise<any> {
    jestConfig.reporters = [];

    return this.testRunner.runCLI({
      config: JSON.stringify(jestConfig),
      runInBand: true,
      silent: true
    }, [projectRoot]);
  }
}