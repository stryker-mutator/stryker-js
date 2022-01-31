import { StrykerOptions } from '../core/index.js';
import { Logger, LoggerFactoryMethod } from '../logging/index.js';

import { PluginResolver } from './plugins.js';
import { commonTokens } from './tokens.js';

/**
 * The basic dependency injection context within Stryker
 */
export interface BaseContext {
  [commonTokens.getLogger]: LoggerFactoryMethod;
  [commonTokens.logger]: Logger;
  [commonTokens.pluginResolver]: PluginResolver;
}

/**
 * The dependency injection context for most of Stryker's plugins.
 * Can inject basic stuff as well as the Stryker options
 */
export interface PluginContext extends BaseContext {
  [commonTokens.options]: StrykerOptions;
}
