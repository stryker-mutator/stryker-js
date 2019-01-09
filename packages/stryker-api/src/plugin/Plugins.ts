import { TestFramework } from '../../test_framework';
import { TestRunner } from '../../test_runner';
import { Reporter } from '../../report';
import { Mutator } from '../../mutant';
import { Transpiler } from '../../transpile';
import { PluginContexts } from './Contexts';
import { ConfigEditor } from '../../config';
import { InjectionToken, InjectableClass } from 'typed-inject';
import { PluginKind } from './PluginKind';

export interface BasePlugin<TPlugin extends PluginKind, R, Tokens extends InjectionToken<PluginContexts[TPlugin]>[]> {
  readonly kind: TPlugin;
  readonly name: string;
  readonly injectable: InjectableClass<PluginContexts[TPlugin], R, Tokens>;
}

export function reporterPlugin<Tokens extends InjectionToken<PluginContexts[PluginKind.Reporter]>[]>(p: ReporterPlugin<Tokens>) {
  return p;
}

export interface ReporterPlugin<Tokens extends InjectionToken<PluginContexts[PluginKind.Reporter]>[]> extends BasePlugin<PluginKind.Reporter, Reporter, Tokens> { }
export interface ConfigEditorPlugin<Tokens extends InjectionToken<PluginContexts[PluginKind.ConfigEditor]>[]> extends BasePlugin<PluginKind.ConfigEditor, ConfigEditor, Tokens> { }
export interface MutatorPlugin<Tokens extends InjectionToken<PluginContexts[PluginKind.Mutator]>[]> extends BasePlugin<PluginKind.Mutator, Mutator, Tokens> { }
export interface TestFrameworkPlugin<Tokens extends InjectionToken<PluginContexts[PluginKind.TestFramework]>[]> extends BasePlugin<PluginKind.TestFramework, TestFramework, Tokens> { }
export interface TestRunnerPlugin<Tokens extends InjectionToken<PluginContexts[PluginKind.TestRunner]>[]> extends BasePlugin<PluginKind.TestRunner, TestRunner, Tokens> { }
export interface TranspilerPlugin<Tokens extends InjectionToken<PluginContexts[PluginKind.Transpiler]>[]> extends BasePlugin<PluginKind.Transpiler, Transpiler, Tokens> { }

export interface Plugins {
  [PluginKind.ConfigEditor]: ConfigEditorPlugin<InjectionToken<PluginContexts[PluginKind.ConfigEditor]>[]>;
  [PluginKind.Mutator]: MutatorPlugin<InjectionToken<PluginContexts[PluginKind.Mutator]>[]>;
  [PluginKind.Reporter]: ReporterPlugin<InjectionToken<PluginContexts[PluginKind.Reporter]>[]>;
  [PluginKind.TestFramework]: TestFrameworkPlugin<InjectionToken<PluginContexts[PluginKind.TestFramework]>[]>;
  [PluginKind.TestRunner]: TestRunnerPlugin<InjectionToken<PluginContexts[PluginKind.TestRunner]>[]>;
  [PluginKind.Transpiler]: TranspilerPlugin<InjectionToken<PluginContexts[PluginKind.Transpiler]>[]>;
}

export interface PluginResolver {
  resolve<T extends keyof Plugins>(kind: T, name: string): Plugins[T];
}
