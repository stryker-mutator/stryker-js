import StrykerPlugin from './StrykerPlugin';
import PluginKind from './PluginKind';
import InjectorKey from './InjectorKey';

export default interface PluginResolver {
  resolve(kind: PluginKind, name: string): StrykerPlugin<any, InjectorKey[]>;
}
