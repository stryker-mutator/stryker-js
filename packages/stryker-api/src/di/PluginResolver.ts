import StrykerPlugin from './StrykerPlugin';
import PluginKind from './PluginKind';
import InjectionToken from './InjectionToken';

export default interface PluginResolver {
  resolve(kind: PluginKind, name: string): StrykerPlugin<any, InjectionToken[]>;
}
