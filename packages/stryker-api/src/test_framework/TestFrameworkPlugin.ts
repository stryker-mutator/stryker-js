import TestFramework from './TestFramework';
import { StrykerPlugin, PluginKind, PluginContext } from '../../di';
import { InjectionToken } from 'typed-inject';

export interface TestFrameworkPlugin<Tokens extends InjectionToken<PluginContext>[]> extends StrykerPlugin<PluginContext, TestFramework, Tokens> {
  readonly kind: PluginKind.TestFramework;
}

export function testFrameworkPlugin<Tokens extends InjectionToken<PluginContext>[]>(testFrameworkPlugin: TestFrameworkPlugin<Tokens>) {
  return testFrameworkPlugin;
}
