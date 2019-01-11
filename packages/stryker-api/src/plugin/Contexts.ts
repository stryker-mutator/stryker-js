import { LoggerFactoryMethod, Logger } from '../../logging';
import { StrykerOptions } from '../../core';
import { PluginResolver } from './Plugins';
import { Config } from '../../config';
import { PluginKind } from './PluginKind';
import { commonTokens } from './tokens';

export interface StrykerContext {
  [commonTokens.getLogger]: LoggerFactoryMethod;
  [commonTokens.logger]: Logger;
  [commonTokens.pluginResolver]: PluginResolver;
}

export interface TranspilerPluginContext extends PluginContext {
  [commonTokens.produceSourceMaps]: boolean;
}

export interface TestRunnerPluginContext extends PluginContext {
  [commonTokens.sandboxFileNames]: ReadonlyArray<string>;
}

export interface PluginContext extends StrykerContext {
  [commonTokens.options]: StrykerOptions;
  /**
   * @deprecated This is just here to migrate between old and new plugins. Don't use this! Use `options` instead
   */
  [commonTokens.config]: Config;
}

export interface PluginContexts {
  [PluginKind.ConfigEditor]: StrykerContext;
  [PluginKind.Mutator]: PluginContext;
  [PluginKind.Reporter]: PluginContext;
  [PluginKind.TestFramework]: PluginContext;
  [PluginKind.TestRunner]: TestRunnerPluginContext;
  [PluginKind.Transpiler]: TranspilerPluginContext;
}
