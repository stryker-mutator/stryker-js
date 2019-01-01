import Reporter from './Reporter';
import { InjectionToken, StrykerPlugin, PluginKind } from '../../di';

export default interface ReporterPlugin<TS extends InjectionToken[]> extends StrykerPlugin<Reporter, TS> {
  readonly kind: PluginKind.Reporter;
}
