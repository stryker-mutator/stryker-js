import Mutator from './Mutator';
import { InjectionToken, StrykerPlugin, PluginKind } from '../../di';

export default interface MutatorPlugin<TS extends InjectionToken[]> extends StrykerPlugin<Mutator, TS> {
  readonly kind: PluginKind.Mutator;
}
