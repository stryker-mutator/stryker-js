import { StrykerOptions } from '../core';
import { Logger, LoggerFactoryMethod } from '../logging';

import { PluginResolver } from './plugins';
import { commonTokens } from './tokens';

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
