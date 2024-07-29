import { PluginContext } from '@stryker-mutator/api/plugin';
import type { requireResolve } from '@stryker-mutator/util';

import { JestWrapper, JestConfigWrapper } from './utils/index.js';

export const pluginTokens = {
  requireFromCwd: 'requireFromCwd',
  resolve: 'resolve',
  resolveFromDirectory: 'resolveFromDirectory',
  configLoader: 'configLoader',
  processEnv: 'processEnv',
  jestTestAdapter: 'jestTestAdapter',
  globalNamespace: 'globalNamespace',
  jestWrapper: 'jestWrapper',
  jestConfigWrapper: 'jestConfigWrapper',
} as const;

export interface JestPluginContext extends PluginContext {
  [pluginTokens.jestWrapper]: JestWrapper;
  [pluginTokens.resolve]: RequireResolve;
  [pluginTokens.requireFromCwd]: typeof requireResolve;
  [pluginTokens.processEnv]: typeof process.env;
  [pluginTokens.jestConfigWrapper]: JestConfigWrapper;
}
