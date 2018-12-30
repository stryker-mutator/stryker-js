import Injectable from './Injectable';
import InjectorKey from './InjectorKey';
import PluginKind from './PluginKind';

export default interface StrykerPlugin<T, TArgKeys extends InjectorKey[]> extends Injectable<T, TArgKeys> {
  readonly pluginName: string;
  readonly kind: PluginKind;
}
