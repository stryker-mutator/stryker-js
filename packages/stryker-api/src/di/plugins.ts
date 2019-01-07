import { TestFrameworkPlugin } from '../../test_framework';
import { TestRunnerPluginContext, TestRunnerPlugin } from '../../test_runner';
import { ReporterPlugin } from '../../report';
import { MutatorPlugin } from '../../mutant';
import { TranspilerPlugin, TranspilerPluginContext } from '../../transpile';
import { PluginContext, StrykerContext } from './Contexts';
import { ConfigEditorPlugin } from '../../config';
import { InjectionToken, InjectableClass } from 'typed-inject';

export interface StrykerPlugin<TContext, R, Tokens extends InjectionToken<TContext>[]> {
  readonly name: string;
  readonly kind: PluginKind;
  readonly injectable: InjectableClass<TContext, R, Tokens>;
}

export enum PluginKind {
  ConfigEditor = 'ConfigEditor',
  TestRunner = 'TestRunner',
  TestFramework = 'TestFramework',
  Transpiler = 'Transpiler',
  Mutator = 'Mutator',
  Reporter = 'Reporter'
}

export interface Plugins {
  [PluginKind.ConfigEditor]: ConfigEditorPlugin<InjectionToken<PluginContexts[PluginKind.ConfigEditor]>[]>;
  [PluginKind.Mutator]: MutatorPlugin<InjectionToken<PluginContexts[PluginKind.Mutator]>[]>;
  [PluginKind.Reporter]: ReporterPlugin<InjectionToken<PluginContexts[PluginKind.Reporter]>[]>;
  [PluginKind.TestFramework]: TestFrameworkPlugin<InjectionToken<PluginContexts[PluginKind.TestFramework]>[]>;
  [PluginKind.TestRunner]: TestRunnerPlugin<InjectionToken<PluginContexts[PluginKind.TestRunner]>[]>;
  [PluginKind.Transpiler]: TranspilerPlugin<InjectionToken<PluginContexts[PluginKind.Transpiler]>[]>;
}

export interface PluginContexts {
  [PluginKind.ConfigEditor]: StrykerContext;
  [PluginKind.Mutator]: PluginContext;
  [PluginKind.Reporter]: PluginContext;
  [PluginKind.TestFramework]: PluginContext;
  [PluginKind.TestRunner]: TestRunnerPluginContext;
  [PluginKind.Transpiler]: TranspilerPluginContext;
}

export interface PluginResolver {
  resolve<T extends keyof Plugins>(kind: T, name: string): Plugins[T];
}
