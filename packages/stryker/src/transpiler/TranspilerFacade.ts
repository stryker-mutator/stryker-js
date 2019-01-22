import { File, StrykerOptions } from 'stryker-api/core';
import { Transpiler } from 'stryker-api/transpile';
import { StrykerError } from '@stryker-mutator/util';
import { tokens, commonTokens, PluginKind } from 'stryker-api/plugin';
import { coreTokens, createCoreInjector } from '../di';
import { PluginCreator } from '../di/PluginCreator';
import { Config } from 'stryker-api/config';

class NamedTranspiler {
  constructor(public name: string, public transpiler: Transpiler) { }
}

export class TranspilerFacade implements Transpiler {

  private readonly innerTranspilers: NamedTranspiler[];

  public static inject = tokens(
    commonTokens.options,
    coreTokens.pluginCreatorTranspiler);

  constructor(options: StrykerOptions, pluginCreator: PluginCreator<PluginKind.Transpiler>) {
    this.innerTranspilers = options.transpilers
      .map(transpilerName => new NamedTranspiler(transpilerName, pluginCreator.create(transpilerName)));
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

export function createTranspilerFacade(options: StrykerOptions, produceSourceMaps: boolean): Transpiler {
  return createCoreInjector(options as unknown as Config)
    .provideValue(commonTokens.produceSourceMaps, produceSourceMaps)
    .provideFactory(coreTokens.pluginCreatorTranspiler, PluginCreator.createFactory(PluginKind.Transpiler))
    .injectClass(TranspilerFacade);
}
