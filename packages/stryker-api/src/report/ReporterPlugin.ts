import Reporter from './Reporter';
import { StrykerPlugin, PluginKind, PluginContext } from '../../di';
import { InjectionToken } from 'typed-inject';

export interface ReporterPlugin<Tokens extends InjectionToken<PluginContext>[]> extends StrykerPlugin<PluginContext, Reporter, Tokens> {
  readonly kind: PluginKind.Reporter;
}

export function reporterPlugin<Tokens extends InjectionToken<PluginContext>[]>(reporterPlugin: ReporterPlugin<Tokens>) {
  return reporterPlugin;
}
