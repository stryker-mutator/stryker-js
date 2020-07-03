import { File, StrykerOptions } from '@stryker-mutator/api/core';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { Transpiler } from '@stryker-mutator/api/transpile';
import { Disposable } from 'typed-inject';

import ChildProcessProxy from '../child-proxy/ChildProcessProxy';
import { coreTokens } from '../di';
import { LoggingClientContext } from '../logging';

import { ChildProcessTranspilerWorker } from './ChildProcessTranspilerWorker';

export class ChildProcessTranspiler implements Transpiler, Disposable {
  private readonly childProcess: ChildProcessProxy<ChildProcessTranspilerWorker>;

  public static inject = tokens(commonTokens.options, coreTokens.loggingContext, commonTokens.produceSourceMaps);

  constructor(options: StrykerOptions, loggingContext: LoggingClientContext, produceSourceMaps: boolean) {
    this.childProcess = ChildProcessProxy.create(
      require.resolve(`./${ChildProcessTranspilerWorker.name}`),
      loggingContext,
      options,
      { [commonTokens.produceSourceMaps]: produceSourceMaps },
      process.cwd(),
      ChildProcessTranspilerWorker
    );
  }

  public transpile(files: readonly File[]): Promise<readonly File[]> {
    return this.childProcess.proxy.transpile(files);
  }

  public dispose() {
    this.childProcess.dispose();
  }
}
