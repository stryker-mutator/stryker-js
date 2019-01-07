import { LoggerFactoryMethod, Logger } from '../../logging';
import { StrykerOptions } from '../../core';
import { PluginResolver } from './Plugins';
import { Config } from '../../config';

function token<T extends string>(value: T): T {
  return value;
}

export const commonTokens = Object.freeze({
  /**
   * @deprecated Use 'options' instead. This is just hear to support plugin migration
   */
  config: token('config'),
  getLogger: token('getLogger'),
  logger: token('logger'),
  options: token('options'),
  pluginResolver: token('pluginResolver')
});

export interface StrykerContext {
  [commonTokens.getLogger]: LoggerFactoryMethod;
  [commonTokens.logger]: Logger;
  [commonTokens.pluginResolver]: PluginResolver;
}

export interface PluginContext extends StrykerContext {
  [commonTokens.options]: StrykerOptions;
  /**
   * @deprecated This is just here to migrate between old and new plugins. Don't use this! Use `options` instead
   */
  [commonTokens.config]: Config;
}
