import { InjectorKey, StrykerPlugin, PluginKind } from '../../di';
import TestRunner from './TestRunner';

export default interface TestRunnerPlugin<TS extends InjectorKey[]> extends StrykerPlugin<TestRunner, TS> {
  readonly kind: PluginKind.TestRunner;
}
