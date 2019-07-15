import { StrykerOptions, File } from '@stryker-mutator/api/core';
import { ChildProcessTranspiler } from './ChildProcessTranspiler';
import { TranspilerPluginContext, Injector, COMMON_TOKENS, tokens, Disposable } from '@stryker-mutator/api/plugin';
import { coreTokens } from '../di';
import LoggingClientContext from '../logging/LoggingClientContext';
import { Transpiler } from '@stryker-mutator/api/transpile';

/**
 * Creates a transpiler. If one is configured, spawns that in a child process
 */
export function transpilerFactory(
  options: StrykerOptions,
  injector: Injector<TranspilerPluginContext & { [coreTokens.LoggingContext]: LoggingClientContext }>
): Transpiler & Disposable {
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
transpilerFactory.inject = tokens(COMMON_TOKENS.options, COMMON_TOKENS.injector);
