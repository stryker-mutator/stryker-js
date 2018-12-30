import { LoggerFactoryMethod, Logger } from '../../logging';
import { StrykerOptions } from '../../core';
import PluginResolver from './PluginResolver';
import Inject from './Inject';
import { Config } from '../../config';

export default interface Container {
  getLogger: LoggerFactoryMethod;
  logger: Logger;
  options: StrykerOptions;
  produceSourceMaps: boolean;
  sandboxFileNames: string[];
  pluginResolver: PluginResolver;
  inject: Inject;
  /**
   * @deprecated This is just here to migrate between old and new plugins. Don't use this! Use `options` instead
   */
  config: Config;
}
