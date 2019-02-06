import { Transpiler } from 'stryker-api/transpile';
import { coreTokens } from '../di';
import { commonTokens, PluginKind, TranspilerPluginContext } from 'stryker-api/plugin';
import { File } from 'stryker-api/core';
import { PluginCreator } from '../di/PluginCreator';
import { TranspilerFacade } from './TranspilerFacade';
import { Injector } from 'typed-inject';

export class ChildProcessTranspilerWorker implements Transpiler {
  private readonly innerTranspiler: Transpiler;

  public static inject = [commonTokens.injector];
  constructor(injector: Injector<TranspilerPluginContext>) {
    this.innerTranspiler = injector
      .provideFactory(coreTokens.pluginCreatorTranspiler, PluginCreator.createFactory(PluginKind.Transpiler))
      .injectClass(TranspilerFacade);
  }

  public transpile(files: ReadonlyArray<File>): Promise<ReadonlyArray<File>> {
    return this.innerTranspiler.transpile(files);
  }
}
