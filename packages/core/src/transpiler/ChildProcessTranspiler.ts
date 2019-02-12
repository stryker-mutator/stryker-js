import { Transpiler } from '@stryker-mutator/api/transpile';
import { ChildProcessTranspilerWorker } from './ChildProcessTranspilerWorker';
import ChildProcessProxy from '../child-proxy/ChildProcessProxy';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { coreTokens } from '../di';
import { StrykerOptions, File } from '@stryker-mutator/api/core';
import LoggingClientContext from '../logging/LoggingClientContext';
import { Disposable } from 'typed-inject';

export class ChildProcessTranspiler implements Transpiler, Disposable {

  private readonly childProcess: ChildProcessProxy<ChildProcessTranspilerWorker>;

  public static inject = tokens(
    commonTokens.options,
    coreTokens.loggingContext,
    commonTokens.produceSourceMaps);

  constructor(options: StrykerOptions,
              loggingContext: LoggingClientContext,
              produceSourceMaps: boolean) {
    this.childProcess = ChildProcessProxy.create(
      require.resolve(`./${ChildProcessTranspilerWorker.name}`),
      loggingContext,
      options,
      { [commonTokens.produceSourceMaps]: produceSourceMaps },
      process.cwd(),
      ChildProcessTranspilerWorker
    );
  }

  public transpile(files: ReadonlyArray<File>): Promise<ReadonlyArray<File>> {
    return this.childProcess.proxy.transpile(files);
  }

  public dispose() {
    this.childProcess.dispose();
  }
}
