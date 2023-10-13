// @ts-check
import { PluginKind, declareClassPlugin } from '@stryker-mutator/api/plugin';

export class ConsoleIgnorer {
  /**
   * @param {import('@stryker-mutator/api/ignorer').NodePath} path
   * @returns {import('@stryker-mutator/api/ignorer').IgnoreResult} */
  shouldIgnore(path) {
    return false;
  }
}
export const strykerPlugins = declareClassPlugin(PluginKind.Ignorer, 'ConsoleIgnorer', ConsoleIgnorer);
