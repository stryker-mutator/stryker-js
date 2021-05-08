import { Checker, CheckResult, CheckStatus } from '@stryker-mutator/api/check';
import { StrykerOptions, Mutant } from '@stryker-mutator/api/core';
import { PluginKind, tokens, commonTokens, PluginContext, Injector } from '@stryker-mutator/api/plugin';
import { StrykerError } from '@stryker-mutator/util';

import { PluginCreator } from '../di';

export class CheckerWorker implements Checker {
  private readonly innerCheckers: Array<{ name: string; checker: Checker }> = [];

  public static inject = tokens(commonTokens.options, commonTokens.injector);
  constructor(options: StrykerOptions, injector: Injector<PluginContext>) {
    const pluginCreator = injector.injectFunction(PluginCreator.createFactory(PluginKind.Checker));
    this.innerCheckers = options.checkers.map((name) => ({ name, checker: pluginCreator.create(name) }));
  }
  public async init(): Promise<void> {
    for await (const { name, checker } of this.innerCheckers) {
      try {
        await checker.init();
      } catch (error) {
        throw new StrykerError(`An error occurred during initialization of the "${name}" checker`, error);
      }
    }
  }
  public async check(mutant: Mutant): Promise<CheckResult> {
    for await (const { checker } of this.innerCheckers) {
      const result = await checker.check(mutant);
      if (result.status !== CheckStatus.Passed) {
        return result;
      }
    }
    return { status: CheckStatus.Passed };
  }
}
