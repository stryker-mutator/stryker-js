import { Config, ConfigEditor } from 'stryker-api/config';
import { Injector, tokens, INJECTOR_TOKEN } from 'typed-inject';
import { BaseContext, PluginResolver, PluginKind, commonTokens } from 'stryker-api/plugin';
import { createPlugin } from '../di/createPlugin';

/**
 * Class that applies all config editor plugins
 */
export class ConfigEditorApplier implements ConfigEditor {
  constructor(private readonly pluginResolver: PluginResolver, private readonly injector: Injector<BaseContext>) { }
  public static inject = tokens(commonTokens.pluginResolver, INJECTOR_TOKEN);

  public edit(config: Config): void {
    this.pluginResolver.resolveAll(PluginKind.ConfigEditor).forEach(plugin => {
      const configEditor = createPlugin(PluginKind.ConfigEditor, plugin, this.injector);
      configEditor.edit(config);
    });
  }
}
