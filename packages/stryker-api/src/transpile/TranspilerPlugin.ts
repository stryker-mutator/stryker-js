import { PluginContext, PluginKind, StrykerPlugin } from '../../di';
import Transpiler from './Transpiler';
import { InjectionToken } from 'typed-inject';

export interface TranspilerPluginContext extends PluginContext {
  produceSourceMaps: boolean;
}

export interface TranspilerPlugin<Tokens extends InjectionToken<TranspilerPluginContext>[]>
  extends StrykerPlugin<TranspilerPluginContext, Transpiler, Tokens> {
  readonly kind: PluginKind.Transpiler;
}

export function transpilerPlugin<Tokens extends InjectionToken<TranspilerPluginContext>[]>(transpilerPlugin: TranspilerPlugin<Tokens>) {
  return transpilerPlugin;
}
