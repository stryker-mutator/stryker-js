import Injectable from './Injectable';
import InjectionToken from './InjectionToken';
import PluginKind from './PluginKind';

export default interface StrykerPlugin<T, TArgKeys extends InjectionToken[]> extends Injectable<T, TArgKeys> {
  readonly pluginName: string;
  readonly kind: PluginKind;
}
