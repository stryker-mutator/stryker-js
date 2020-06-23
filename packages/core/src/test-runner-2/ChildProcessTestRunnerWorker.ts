import { StrykerOptions } from '@stryker-mutator/api/core';
import { commonTokens, Injector, OptionsContext, PluginKind, tokens } from '@stryker-mutator/api/plugin';
import { TestRunner2, DryRunOptions, MutantRunOptions, MutantRunResult, DryRunResult } from '@stryker-mutator/api/test_runner2';

import { PluginCreator } from '../di';

export class ChildProcessTestRunnerWorker implements TestRunner2 {
  private readonly underlyingTestRunner: TestRunner2;

  public static inject = tokens(commonTokens.sandboxFileNames, commonTokens.options, commonTokens.injector);
  constructor(sandboxFileNames: readonly string[], { testRunner }: StrykerOptions, injector: Injector<OptionsContext>) {
    this.underlyingTestRunner = injector
      .provideValue(commonTokens.sandboxFileNames, sandboxFileNames)
      .injectFunction(PluginCreator.createFactory(PluginKind.TestRunner2))
      .create(testRunner);
  }

  public async init(): Promise<void> {
    if (this.underlyingTestRunner.init) {
      await this.underlyingTestRunner.init();
    }
  }

  public async dispose() {
    if (this.underlyingTestRunner.dispose) {
      await this.underlyingTestRunner.dispose();
    }
  }

  public dryRun(options: DryRunOptions): Promise<DryRunResult> {
    return this.underlyingTestRunner.dryRun(options);
  }
  public mutantRun(options: MutantRunOptions): Promise<MutantRunResult> {
    return this.underlyingTestRunner.mutantRun(options);
  }
}
