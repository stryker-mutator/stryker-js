import { InjectionToken, StrykerPlugin, PluginKind } from '../../di';
import TestFramework from './TestFramework';

export default interface TestFrameworkPlugin<TS extends InjectionToken[]> extends StrykerPlugin<TestFramework, TS> {
  readonly kind: PluginKind.TestFramework;
}
