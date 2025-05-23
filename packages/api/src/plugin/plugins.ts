import type {
  InjectableClass,
  InjectableFunction,
  InjectionToken,
} from 'typed-inject';

import { Reporter } from '../report/index.js';
import { TestRunner } from '../test-runner/index.js';
import { Checker } from '../check/index.js';

import { Ignorer } from '../ignore/ignorer.js';

import { PluginContext } from './contexts.js';
import { PluginKind } from './plugin-kind.js';

/**
 * Represents a StrykerPlugin
 */
export type Plugin<TPluginKind extends PluginKind> =
  | ClassPlugin<TPluginKind, Array<InjectionToken<PluginContext>>>
  | FactoryPlugin<TPluginKind, Array<InjectionToken<PluginContext>>>
  | ValuePlugin<TPluginKind>;

/**
 * Represents a plugin that is created with a factory method
 */
export interface FactoryPlugin<
  TPluginKind extends PluginKind,
  Tokens extends Array<InjectionToken<PluginContext>>,
> {
  readonly kind: TPluginKind;
  readonly name: string;
  /**
   * The factory method used to create the plugin
   */
  readonly factory: InjectableFunction<
    PluginContext,
    PluginInterfaces[TPluginKind],
    Tokens
  >;
}

/**
 * Represents a plugin that is provided as a simple value.
 */
export interface ValuePlugin<TPluginKind extends PluginKind> {
  readonly kind: TPluginKind;
  readonly name: string;
  readonly value: PluginInterfaces[TPluginKind];
}

/**
 * Represents a plugin that is created by instantiating a class.
 */
export interface ClassPlugin<
  TPluginKind extends PluginKind,
  Tokens extends Array<InjectionToken<PluginContext>>,
> {
  readonly kind: TPluginKind;
  readonly name: string;
  /**
   * The prototype function (class) used to create the plugin.
   * Not called `class` here, because that is a keyword
   */
  readonly injectableClass: InjectableClass<
    PluginContext,
    PluginInterfaces[TPluginKind],
    Tokens
  >;
}

/**
 * Declare a class plugin. Use this method in order to type check the dependency graph of your plugin
 * @param kind The plugin kind
 * @param name The name of the plugin
 * @param injectableClass The class to be instantiated for the plugin
 */
export function declareClassPlugin<
  TPluginKind extends PluginKind,
  Tokens extends Array<InjectionToken<PluginContext>>,
>(
  kind: TPluginKind,
  name: string,
  injectableClass: InjectableClass<
    PluginContext,
    PluginInterfaces[TPluginKind],
    Tokens
  >,
): ClassPlugin<TPluginKind, Tokens> {
  return {
    injectableClass,
    kind,
    name,
  };
}

/**
 * Declare a factory plugin. Use this method in order to type check the dependency graph of your plugin,
 * @param kind The plugin kind
 * @param name The name of the plugin
 * @param factory The factory used to instantiate the plugin
 */
export function declareFactoryPlugin<
  TPluginKind extends PluginKind,
  Tokens extends Array<InjectionToken<PluginContext>>,
>(
  kind: TPluginKind,
  name: string,
  factory: InjectableFunction<
    PluginContext,
    PluginInterfaces[TPluginKind],
    Tokens
  >,
): FactoryPlugin<TPluginKind, Tokens> {
  return {
    factory,
    kind,
    name,
  };
}

/**
 * Declare a value plugin. Use this method for simple plugins where you don't need values to be injected.
 * @param kind The plugin kind
 * @param name The name of the plugin
 * @param value The plugin
 */
export function declareValuePlugin<TPluginKind extends PluginKind>(
  kind: TPluginKind,
  name: string,
  value: PluginInterfaces[TPluginKind],
): ValuePlugin<TPluginKind> {
  return {
    value,
    kind,
    name,
  };
}

/**
 * Lookup type for plugin interfaces by kind.
 */
export interface PluginInterfaces {
  [PluginKind.Reporter]: Reporter;
  [PluginKind.TestRunner]: TestRunner;
  [PluginKind.Checker]: Checker;
  [PluginKind.Ignore]: Ignorer;
}

/**
 * Lookup type for plugins by kind.
 */
export type Plugins = {
  [TPluginKind in keyof PluginInterfaces]: Plugin<TPluginKind>;
};
