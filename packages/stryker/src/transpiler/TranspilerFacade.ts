import { File, StrykerOptions } from 'stryker-api/core';
import { Transpiler, TranspilerOptions, TranspilerFactory } from 'stryker-api/transpile';
import { StrykerError } from '@stryker-mutator/util';
import { tokens, commonTokens, TranspilerPluginContext, PluginResolver, PluginKind } from 'stryker-api/plugin';
import { Injector } from 'typed-inject';
import { createPlugin } from '../di/createPlugin';

class NamedTranspiler {
  constructor(public name: string, public transpiler: Transpiler) { }
}

export default class TranspilerFacade implements Transpiler {

  private readonly innerTranspilers: NamedTranspiler[];

  public static inject = tokens(
    commonTokens.options,
    commonTokens.injector,
    commonTokens.pluginResolver);

  constructor(options: StrykerOptions, injector: Injector<TranspilerPluginContext>, pluginResolver: PluginResolver) {
    this.innerTranspilers = options.transpilers
      .map(transpilerName => {
        const transpiler = createPlugin(PluginKind.Transpiler, pluginResolver.resolve(PluginKind.Transpiler, transpilerName), injector);
        return new NamedTranspiler(transpilerName, transpiler);
      });
  }

  public transpile(files: ReadonlyArray<File>): Promise<ReadonlyArray<File>> {
    return this.performTranspileChain(files);
  }

  private async performTranspileChain(
    input: ReadonlyArray<File>,
    remainingChain: NamedTranspiler[] = this.innerTranspilers.slice()
  ): Promise<ReadonlyArray<File>> {
    const current = remainingChain.shift();
    if (current) {
      const output = await current.transpiler.transpile(input)
        .catch(error => {
          throw new StrykerError(`An error occurred in transpiler "${current.name}"`, error);
        });
      return this.performTranspileChain(output, remainingChain);
    } else {
      return input;
    }
  }
}
