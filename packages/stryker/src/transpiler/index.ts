import { StrykerOptions, File } from 'stryker-api/core';
import { ChildProcessTranspiler } from './ChildProcessTranspiler';
import { TranspilerPluginContext, Injector, commonTokens, tokens, Disposable } from 'stryker-api/plugin';
import { coreTokens } from '../di';
import LoggingClientContext from '../logging/LoggingClientContext';
import { Transpiler } from 'stryker-api/transpile';

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
