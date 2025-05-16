import { Checker, CheckResult } from '@stryker-mutator/api/check';
import { StrykerOptions, Mutant } from '@stryker-mutator/api/core';
import { PluginKind, tokens, commonTokens } from '@stryker-mutator/api/plugin';
import { StrykerError } from '@stryker-mutator/util';

import { coreTokens, PluginCreator } from '../di/index.js';

import { CheckerResource } from './checker-resource.js';

export class CheckerWorker implements CheckerResource {
  private readonly innerCheckers: Map<string, Checker>;

  public static inject = tokens(commonTokens.options, coreTokens.pluginCreator);
  constructor(options: StrykerOptions, pluginCreator: PluginCreator) {
    this.innerCheckers = new Map(
      options.checkers.map((name) => [
        name,
        pluginCreator.create(PluginKind.Checker, name),
      ]),
    );
  }
  public async init(): Promise<void> {
    for (const [name, checker] of this.innerCheckers.entries()) {
      try {
        await checker.init();
      } catch (error: unknown) {
        throw new StrykerError(
          `An error occurred during initialization of the "${name}" checker`,
          error,
        );
      }
    }
  }
  public async check(
    checkerName: string,
    mutants: Mutant[],
  ): Promise<Record<string, CheckResult>> {
    return this.perform(checkerName, (checker) => checker.check(mutants));
  }

  public async group(
    checkerName: string,
    mutants: Mutant[],
  ): Promise<string[][]> {
    return this.perform(
      checkerName,
      (checker) =>
        checker.group?.(mutants) ??
        // Group one by one by default
        mutants.map(({ id }) => [id]),
    );
  }

  private perform<T>(checkerName: string, act: (checker: Checker) => T) {
    const checker = this.innerCheckers.get(checkerName);
    if (checker) {
      return act(checker);
    } else {
      throw new Error(`Checker ${checkerName} does not exist!`);
    }
  }
}
