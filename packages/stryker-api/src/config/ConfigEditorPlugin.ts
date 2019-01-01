import ConfigEditor from './ConfigEditor';
import { InjectionToken, StrykerPlugin, PluginKind } from '../../di';

export default interface ConfigEditorPlugin<TS extends InjectionToken[]> extends StrykerPlugin<ConfigEditor, TS> {
  readonly kind: PluginKind.ConfigEditor;
}
