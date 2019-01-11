import { LoggerFactoryMethod, Logger } from '../../logging';
import { StrykerOptions } from '../../core';
import { PluginResolver } from './Plugins';
import { Config } from '../../config';
import { PluginKind } from './PluginKind';
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
export interface OptionsContext extends BaseContext {
  [commonTokens.options]: StrykerOptions;
  /**
   * @deprecated This is just here to migrate between old and new plugins. Don't use this! Use `options` instead
   */
  [commonTokens.config]: Config;
}

/**
 * The dependency injection context for a `TranspilerPlugin`
 */
export interface TranspilerPluginContext extends OptionsContext {
  [commonTokens.produceSourceMaps]: boolean;
}

/**
 * The dependency injection context for a `TestRunnerPlugin`
 */
export interface TestRunnerPluginContext extends OptionsContext {
  [commonTokens.sandboxFileNames]: ReadonlyArray<string>;
}

/**
 * Lookup type for plugin contexts by kind.
 */
export interface PluginContexts {
  [PluginKind.ConfigEditor]: BaseContext;
  [PluginKind.Mutator]: OptionsContext;
  [PluginKind.Reporter]: OptionsContext;
  [PluginKind.TestFramework]: OptionsContext;
  [PluginKind.TestRunner]: TestRunnerPluginContext;
  [PluginKind.Transpiler]: TranspilerPluginContext;
}
