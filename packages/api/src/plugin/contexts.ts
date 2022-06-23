import { FileDescriptions, StrykerOptions } from '../core/index.js';
import { Logger, LoggerFactoryMethod } from '../logging/index.js';

import { commonTokens } from './tokens.js';

/**
 * The basic dependency injection context within Stryker
 */
export interface BaseContext {
  [commonTokens.getLogger]: LoggerFactoryMethod;
  [commonTokens.logger]: Logger;
}

/**
 * The dependency injection context for most of Stryker's plugins.
 * Can inject basic stuff as well as the Stryker options
 */
export interface PluginContext extends BaseContext {
  [commonTokens.options]: StrykerOptions;
  [commonTokens.fileDescriptions]: FileDescriptions;
}
