import Mutator from './Mutator';
import { StrykerPlugin, PluginKind, PluginContext } from '../../di';
import { InjectionToken } from 'typed-inject';

export interface MutatorPlugin<Tokens extends InjectionToken<PluginContext>[]>
  extends StrykerPlugin<PluginContext, Mutator, Tokens> {
  readonly kind: PluginKind.Mutator;
}

export function mutatorPlugin<Tokens extends InjectionToken<PluginContext>[]>(mutatorPlugin: MutatorPlugin<Tokens>) {
  return mutatorPlugin;
}
