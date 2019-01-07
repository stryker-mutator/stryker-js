import TestRunner from './TestRunner';
import { StrykerPlugin, PluginKind, PluginContext } from '../../di';
import { InjectionToken } from 'typed-inject';

export interface TestRunnerPluginContext extends PluginContext {
  sandboxFileNames: ReadonlyArray<string>;
}

export interface TestRunnerPlugin<Tokens extends InjectionToken<TestRunnerPluginContext>[]> extends StrykerPlugin<TestRunnerPluginContext, TestRunner, Tokens> {
  readonly kind: PluginKind.TestRunner;
}

export function testRunnerPlugin<Tokens extends InjectionToken<TestRunnerPluginContext>[]>(testRunnerPlugin: TestRunnerPlugin<Tokens>) {
  return testRunnerPlugin;
}
