import { File, StrykerOptions } from '@stryker-mutator/api/core';
import { commonTokens, Disposable, Injector, tokens, TranspilerPluginContext } from '@stryker-mutator/api/plugin';
import { Transpiler } from '@stryker-mutator/api/transpile';
import { coreTokens } from '../di';
import LoggingClientContext from '../logging/LoggingClientContext';
import { ChildProcessTranspiler } from './ChildProcessTranspiler';

/**
 * Creates a transpiler. If one is configured, spawns that in a child process
 */
export function transpilerFactory(options: StrykerOptions,
                                  injector: Injector<TranspilerPluginContext & { [coreTokens.loggingContext]: LoggingClientContext }>)
  : Transpiler & Disposable {
  if (options.transpilers.length) {
    return injector.injectClass(ChildProcessTranspiler);
  } else {
    return {
      transpile(files: ReadonlyArray<File>) {
        return Promise.resolve(files);
      },
      dispose() {
        // noop
      }
    };
  }
}
transpilerFactory.inject = tokens(commonTokens.options, commonTokens.injector);
