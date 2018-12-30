import Transpiler from './Transpiler';
import { InjectorKey, StrykerPlugin, PluginKind } from '../../di';

export default interface TranspilerPlugin<TS extends InjectorKey[]> extends StrykerPlugin<Transpiler, TS> {
  readonly kind: PluginKind.Transpiler;
}
