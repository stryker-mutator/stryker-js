import { File } from '@stryker-mutator/api/core';
import { commonTokens, PluginKind, TranspilerPluginContext } from '@stryker-mutator/api/plugin';
import { Transpiler } from '@stryker-mutator/api/transpile';
import { Injector } from 'typed-inject';
import { coreTokens } from '../di';
import { PluginCreator } from '../di/PluginCreator';
import { TranspilerFacade } from './TranspilerFacade';

export class ChildProcessTranspilerWorker implements Transpiler {
  private readonly innerTranspiler: Transpiler;

  public static inject = [commonTokens.injector];
  constructor(injector: Injector<TranspilerPluginContext>) {
    this.innerTranspiler = injector
      .provideFactory(coreTokens.pluginCreatorTranspiler, PluginCreator.createFactory(PluginKind.Transpiler))
      .injectClass(TranspilerFacade);
  }

  public transpile(files: readonly File[]): Promise<readonly File[]> {
    return this.innerTranspiler.transpile(files);
  }
}
