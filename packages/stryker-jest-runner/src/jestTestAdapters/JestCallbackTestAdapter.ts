import JestTestAdapter from './JestTestAdapter';

export default class JestCallbackTestAdapter implements JestTestAdapter {
  private testRunner: any;

  public constructor(loader?: NodeRequire) {
    loader = loader || /* istanbul ignore next */ require;

    this.testRunner = loader('jest');
  }

  public run(jestConfig: any, projectRoot: string): Promise<any> {
    jestConfig.reporters = [];

    return new Promise((resolve) => {
      this.testRunner.runCLI({
        config: JSON.stringify(jestConfig),
        runInBand: true,
        silent: true
      }, [projectRoot], (results: any) => resolve({ results }));
    });
  }
}