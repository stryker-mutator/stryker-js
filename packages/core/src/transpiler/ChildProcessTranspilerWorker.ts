import { Transpiler } from '@stryker-mutator/api/transpile';
import { coreTokens } from '../di';
import { COMMON_TOKENS, PluginKind, TranspilerPluginContext } from '@stryker-mutator/api/plugin';
import { File } from '@stryker-mutator/api/core';
import { PluginCreator } from '../di/PluginCreator';
import { TranspilerFacade } from './TranspilerFacade';
import { Injector } from 'typed-inject';

export class ChildProcessTranspilerWorker implements Transpiler {
  private readonly innerTranspiler: Transpiler;

  public static inject = [COMMON_TOKENS.injector];
  constructor(injector: Injector<TranspilerPluginContext>) {
    this.innerTranspiler = injector
      .provideFactory(coreTokens.PluginCreatorTranspiler, PluginCreator.createFactory(PluginKind.Transpiler))
      .injectClass(TranspilerFacade);
  }

  public transpile(files: ReadonlyArray<File>): Promise<ReadonlyArray<File>> {
    return this.innerTranspiler.transpile(files);
  }
}
