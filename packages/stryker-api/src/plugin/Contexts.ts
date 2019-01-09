import { LoggerFactoryMethod, Logger } from '../../logging';
import { StrykerOptions } from '../../core';
import { PluginResolver } from './Plugins';
import { Config } from '../../config';
import { PluginKind } from './PluginKind';

export interface StrykerContext {
  getLogger: LoggerFactoryMethod;
  logger: Logger;
  pluginResolver: PluginResolver;
}

export interface TranspilerPluginContext extends PluginContext {
  produceSourceMaps: boolean;
}

export interface TestRunnerPluginContext extends PluginContext {
  sandboxFileNames: ReadonlyArray<string>;
}

export interface PluginContext extends StrykerContext {
  options: StrykerOptions;
  /**
   * @deprecated This is just here to migrate between old and new plugins. Don't use this! Use `options` instead
   */
  config: Config;
}

export interface PluginContexts {
  [PluginKind.ConfigEditor]: StrykerContext;
  [PluginKind.Mutator]: PluginContext;
  [PluginKind.Reporter]: PluginContext;
  [PluginKind.TestFramework]: PluginContext;
  [PluginKind.TestRunner]: TestRunnerPluginContext;
  [PluginKind.Transpiler]: TranspilerPluginContext;
}
