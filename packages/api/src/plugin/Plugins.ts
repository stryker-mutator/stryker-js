import { InjectableClass, InjectableFunction, InjectionToken } from 'typed-inject';

import { ConfigEditor } from '../../config';
import { Mutator } from '../../mutant';
import { Reporter } from '../../report';
import { TestFramework } from '../../test_framework';
import { TestRunner } from '../../test_runner';
import { Transpiler } from '../../transpile';
import { OptionsEditor } from '../core/OptionsEditor';

import { PluginContexts } from './Contexts';
import { PluginKind } from './PluginKind';

/**
 * Represents a StrykerPlugin
 */
export type Plugin<TPluginKind extends PluginKind> =
  | FactoryPlugin<TPluginKind, Array<InjectionToken<PluginContexts[TPluginKind]>>>
  | ClassPlugin<TPluginKind, Array<InjectionToken<PluginContexts[TPluginKind]>>>;

/**
 * Represents a plugin that is created with a factory method
 */
export interface FactoryPlugin<TPluginKind extends PluginKind, Tokens extends Array<InjectionToken<PluginContexts[TPluginKind]>>> {
  readonly kind: TPluginKind;
  readonly name: string;
  /**
   * The factory method used to create the plugin
   */
  readonly factory: InjectableFunction<PluginContexts[TPluginKind], PluginInterfaces[TPluginKind], Tokens>;
}

/**
 * Represents a plugin that is created by instantiating a class.
 */
export interface ClassPlugin<TPluginKind extends PluginKind, Tokens extends Array<InjectionToken<PluginContexts[TPluginKind]>>> {
  readonly kind: TPluginKind;
  readonly name: string;
  /**
   * The prototype function (class) used to create the plugin.
   * Not called `class` here, because that is a keyword
   */
  readonly injectableClass: InjectableClass<PluginContexts[TPluginKind], PluginInterfaces[TPluginKind], Tokens>;
}

/**
 * Declare a class plugin. Use this method in order to type check the dependency graph of your plugin
 * @param kind The plugin kind
 * @param name The name of the plugin
 * @param injectableClass The class to be instantiated for the plugin
 */
export function declareClassPlugin<TPluginKind extends PluginKind, Tokens extends Array<InjectionToken<PluginContexts[TPluginKind]>>>(
  kind: TPluginKind,
  name: string,
  injectableClass: InjectableClass<PluginContexts[TPluginKind], PluginInterfaces[TPluginKind], Tokens>
): ClassPlugin<TPluginKind, Tokens> {
  return {
    injectableClass,
    kind,
    name
  };
}

/**
 * Declare a factory plugin. Use this method in order to type check the dependency graph of your plugin,
 * @param kind The plugin kind
 * @param name The name of the plugin
 * @param factory The factory used to instantiate the plugin
 */
export function declareFactoryPlugin<TPluginKind extends PluginKind, Tokens extends Array<InjectionToken<PluginContexts[TPluginKind]>>>(
  kind: TPluginKind,
  name: string,
  factory: InjectableFunction<PluginContexts[TPluginKind], PluginInterfaces[TPluginKind], Tokens>
): FactoryPlugin<TPluginKind, Tokens> {
  return {
    factory,
    kind,
    name
  };
}

/**
 * Lookup type for plugin interfaces by kind.
 */
export interface PluginInterfaces {
  [PluginKind.ConfigEditor]: ConfigEditor;
  [PluginKind.OptionsEditor]: OptionsEditor;
  [PluginKind.Mutator]: Mutator;
  [PluginKind.Reporter]: Reporter;
  [PluginKind.TestFramework]: TestFramework;
  [PluginKind.TestRunner]: TestRunner;
  [PluginKind.Transpiler]: Transpiler;
}

/**
 * Lookup type for plugins by kind.
 */
export type Plugins = {
  [TPluginKind in keyof PluginInterfaces]: Plugin<TPluginKind>;
};

/**
 * Plugin resolver responsible to load plugins
 */
export interface PluginResolver {
  resolve<T extends keyof Plugins>(kind: T, name: string): Plugins[T];
  resolveAll<T extends keyof Plugins>(kind: T): Array<Plugins[T]>;
}
