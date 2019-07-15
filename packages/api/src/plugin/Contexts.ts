import { LoggerFactoryMethod, Logger } from '../../logging';
import { StrykerOptions } from '../../core';
import { PluginResolver } from './Plugins';
import { PluginKind } from './PluginKind';
import { COMMON_TOKENS } from './tokens';

/**
 * The basic dependency injection context within Stryker
 */
export interface BaseContext {
  [COMMON_TOKENS.getLogger]: LoggerFactoryMethod;
  [COMMON_TOKENS.logger]: Logger;
  [COMMON_TOKENS.pluginResolver]: PluginResolver;
}

/**
 * The dependency injection context for most of Stryker's plugins.
 * Can inject basic stuff as well as the Stryker options
 */
export interface OptionsContext extends BaseContext {
  [COMMON_TOKENS.options]: StrykerOptions;
}

/**
 * The dependency injection context for a `TranspilerPlugin`
 */
export interface TranspilerPluginContext extends OptionsContext {
  [COMMON_TOKENS.produceSourceMaps]: boolean;
}

/**
 * The dependency injection context for a `TestRunnerPlugin`
 */
export interface TestRunnerPluginContext extends OptionsContext {
  [COMMON_TOKENS.sandboxFileNames]: ReadonlyArray<string>;
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
