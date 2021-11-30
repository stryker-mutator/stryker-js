import { Checker, CheckResult, CheckStatus } from '@stryker-mutator/api/check';
import { StrykerOptions, Mutant } from '@stryker-mutator/api/core';
import { PluginKind, tokens, commonTokens, PluginContext, Injector } from '@stryker-mutator/api/plugin';
import { StrykerError } from '@stryker-mutator/util';

import { PluginCreator } from '../di';

export class CheckerWorker implements Checker {
  private readonly innerCheckers: Record<string, Checker> = {};

  public static inject = tokens(commonTokens.options, commonTokens.injector);
  constructor(options: StrykerOptions, injector: Injector<PluginContext>) {
    const pluginCreator = injector.injectFunction(PluginCreator.createFactory(PluginKind.Checker));
    options.checkers.forEach((name) => (this.innerCheckers[name] = pluginCreator.create(name)));
  }
  public async init(): Promise<void> {
    for await (const [name, checker] of Object.entries(this.innerCheckers)) {
      try {
        await checker.init();
      } catch (error: unknown) {
        throw new StrykerError(`An error occurred during initialization of the "${name}" checker`, error);
      }
    }
  }

  public async check(mutants: Mutant[]): Promise<Array<{ mutant: Mutant; checkResult: CheckResult }>> {
    // todo: fix this
    return this.innerCheckers['typescript-group'].check(mutants);
  }

  public async createGroups(mutants: Mutant[]): Promise<Mutant[][] | undefined> {
    return this.innerCheckers['typescript-group'].createGroups?.(mutants);
  }
}
