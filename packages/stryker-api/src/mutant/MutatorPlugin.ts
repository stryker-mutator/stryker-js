import Mutator from './Mutator';
import { InjectorKey, StrykerPlugin, PluginKind } from '../../di';

export default interface MutatorPlugin<TS extends InjectorKey[]> extends StrykerPlugin<Mutator, TS> {
  readonly kind: PluginKind.Mutator;
}
