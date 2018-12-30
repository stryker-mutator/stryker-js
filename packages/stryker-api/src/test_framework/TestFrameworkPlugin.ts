import { InjectorKey, StrykerPlugin, PluginKind } from '../../di';
import TestFramework from './TestFramework';

export default interface TestFrameworkPlugin<TS extends InjectorKey[]> extends StrykerPlugin<TestFramework, TS> {
  readonly kind: PluginKind.TestFramework;
}
