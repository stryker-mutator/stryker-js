import Transpiler from './Transpiler';
import { InjectionToken, StrykerPlugin, PluginKind } from '../../di';

export default interface TranspilerPlugin<TS extends InjectionToken[]> extends StrykerPlugin<Transpiler, TS> {
  readonly kind: PluginKind.Transpiler;
}
