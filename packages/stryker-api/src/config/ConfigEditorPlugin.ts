import ConfigEditor from './ConfigEditor';
import { InjectorKey, StrykerPlugin, PluginKind } from '../../di';

export default interface ConfigEditorPlugin<TS extends InjectorKey[]> extends StrykerPlugin<ConfigEditor, TS> {
  readonly kind: PluginKind.ConfigEditor;
}
