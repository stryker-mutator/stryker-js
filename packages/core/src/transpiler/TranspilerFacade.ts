import { File, StrykerOptions } from '@stryker-mutator/api/core';
import { commonTokens, PluginKind, tokens } from '@stryker-mutator/api/plugin';
import { Transpiler } from '@stryker-mutator/api/transpile';
import { StrykerError } from '@stryker-mutator/util';

import { coreTokens } from '../di';
import { PluginCreator } from '../di/PluginCreator';

class NamedTranspiler {
  constructor(public name: string, public transpiler: Transpiler) {}
}

export class TranspilerFacade implements Transpiler {
  private readonly innerTranspilers: NamedTranspiler[];

  public static inject = tokens(commonTokens.options, coreTokens.pluginCreatorTranspiler);

  constructor(options: StrykerOptions, pluginCreator: PluginCreator<PluginKind.Transpiler>) {
    this.innerTranspilers = options.transpilers.map(transpilerName => new NamedTranspiler(transpilerName, pluginCreator.create(transpilerName)));
  }

  public transpile(files: readonly File[]): Promise<readonly File[]> {
    return this.performTranspileChain(files);
  }

  private async performTranspileChain(
    input: readonly File[],
    remainingChain: NamedTranspiler[] = this.innerTranspilers.slice()
  ): Promise<readonly File[]> {
    const current = remainingChain.shift();
    if (current) {
      const output = await current.transpiler.transpile(input).catch(error => {
        throw new StrykerError(`An error occurred in transpiler "${current.name}"`, error);
      });
      return this.performTranspileChain(output, remainingChain);
    } else {
      return input;
    }
  }
}
