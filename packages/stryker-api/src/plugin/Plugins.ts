import { TestFramework } from '../../test_framework';
import { TestRunner } from '../../test_runner';
import { Reporter } from '../../report';
import { Mutator } from '../../mutant';
import { Transpiler } from '../../transpile';
import { ConfigEditor } from '../../config';
import { PluginContexts } from './Contexts';
import { InjectionToken, InjectableClass, InjectableFunction } from 'typed-inject';
import { PluginKind } from './PluginKind';

export type Plugin<TPluginKind extends PluginKind, Tokens extends InjectionToken<PluginContexts[TPluginKind]>[]> =
  FactoryPlugin<TPluginKind, Tokens> | ClassPlugin<TPluginKind, Tokens>;

export interface FactoryPlugin<TPluginKind extends PluginKind, Tokens extends InjectionToken<PluginContexts[TPluginKind]>[]> {
  readonly kind: TPluginKind;
  readonly name: string;
  readonly factory: InjectableFunction<PluginContexts[TPluginKind], PluginKinds[TPluginKind], Tokens>;
}
export interface ClassPlugin<TPluginKind extends PluginKind, Tokens extends InjectionToken<PluginContexts[TPluginKind]>[]> {
  readonly kind: TPluginKind;
  readonly name: string;
  readonly injectableClass: InjectableClass<PluginContexts[TPluginKind], PluginKinds[TPluginKind], Tokens>;
}

export function pluginClass<TPluginKind extends PluginKind, Tokens extends InjectionToken<PluginContexts[TPluginKind]>[]>(kind: TPluginKind, name: string, injectableClass: InjectableClass<PluginContexts[TPluginKind], PluginKinds[TPluginKind], Tokens>):
  ClassPlugin<TPluginKind, Tokens> {
  return {
    injectableClass,
    kind,
    name
  };
}

export function pluginFactory<TPluginKind extends PluginKind, Tokens extends InjectionToken<PluginContexts[TPluginKind]>[]>(kind: TPluginKind, name: string, factory: InjectableFunction<PluginContexts[TPluginKind], PluginKinds[TPluginKind], Tokens>):
  FactoryPlugin<TPluginKind, Tokens> {
  return {
    factory,
    kind,
    name
  };
}

export interface PluginKinds {
  [PluginKind.ConfigEditor]: ConfigEditor;
  [PluginKind.Mutator]: Mutator;
  [PluginKind.Reporter]: Reporter;
  [PluginKind.TestFramework]: TestFramework;
  [PluginKind.TestRunner]: TestRunner;
  [PluginKind.Transpiler]: Transpiler;
}

export type Plugins = {
  [TPluginKind in keyof PluginKinds]: Plugin<TPluginKind, InjectionToken<PluginContexts[TPluginKind]>[]>;
};

export interface PluginResolver {
  resolve<T extends keyof Plugins>(kind: T, name: string): Plugins[T];
  resolveAll<T extends keyof Plugins>(kind: T): Plugins[T][];
}
