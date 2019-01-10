import { Config, ConfigEditor } from 'stryker-api/config';
import { Injector, tokens, INJECTOR_TOKEN } from 'typed-inject';
import { StrykerContext, PluginResolver, PluginKind } from 'stryker-api/plugin';
import { commonTokens } from '@stryker-mutator/util';
import { createPlugin } from '../di/createPlugin';

/**
 * Class that applies all config editor plugins
 */
export class ConfigEditorApplier implements ConfigEditor {
  constructor(private readonly pluginResolver: PluginResolver, private readonly injector: Injector<StrykerContext>) { }
  public static inject = tokens(commonTokens.pluginResolver, INJECTOR_TOKEN);

  public edit(config: Config): void {
    this.pluginResolver.resolveAll(PluginKind.ConfigEditor).forEach(plugin => {
      const configEditor = createPlugin(PluginKind.ConfigEditor, plugin, this.injector);
      configEditor.edit(config);
    });
  }
}
