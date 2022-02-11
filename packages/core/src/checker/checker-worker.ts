import { Checker, CheckResult } from '@stryker-mutator/api/check';
import { StrykerOptions, MutantTestCoverage, Mutant } from '@stryker-mutator/api/core';
import { PluginKind, tokens, commonTokens, PluginContext, Injector } from '@stryker-mutator/api/plugin';
import { StrykerError } from '@stryker-mutator/util';

import { PluginCreator } from '../di';

import { CheckerResource } from './checker-resource';

export class CheckerWorker implements CheckerResource {
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

  public async check(checkerName: string, mutants: Mutant[]): Promise<Record<string, CheckResult>> {
    if (checkerName === '') {
      throw new Error('No checker set.');
    }

    return this.innerCheckers[checkerName].check(mutants);
  }

  public async createGroups(checkerName: string, mutants: MutantTestCoverage[]): Promise<MutantTestCoverage[][] | undefined> {
    if (checkerName === '') {
      throw new Error('No checker set.');
    }

    return this.innerCheckers[checkerName].createGroups?.(mutants);
  }
}
