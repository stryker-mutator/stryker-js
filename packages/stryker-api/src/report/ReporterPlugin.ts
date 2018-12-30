import Reporter from './Reporter';
import { InjectorKey, StrykerPlugin, PluginKind } from '../../di';

export default interface ReporterPlugin<TS extends InjectorKey[]> extends StrykerPlugin<Reporter, TS> {
  readonly kind: PluginKind.Reporter;
}
