import ConfigEditor from './ConfigEditor';
import { StrykerPlugin, PluginKind, StrykerContext } from '../../di';
import { InjectionToken } from 'typed-inject';

export interface ConfigEditorPlugin<Tokens extends InjectionToken<StrykerContext>[]>
  extends StrykerPlugin<StrykerContext, ConfigEditor, Tokens> {
  readonly kind: PluginKind.ConfigEditor;
}

export function configEditorPlugin<Tokens extends InjectionToken<StrykerContext>[]>(reporterPlugin: ConfigEditorPlugin<Tokens>) {
  return reporterPlugin;
}
