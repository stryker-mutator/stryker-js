import { InjectionToken, StrykerPlugin, PluginKind } from '../../di';
import TestRunner from './TestRunner';

export default interface TestRunnerPlugin<TS extends InjectionToken[]> extends StrykerPlugin<TestRunner, TS> {
  readonly kind: PluginKind.TestRunner;
}
