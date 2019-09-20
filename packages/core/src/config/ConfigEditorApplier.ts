import { Config, ConfigEditor } from '@stryker-mutator/api/config';
import { commonTokens, PluginKind, PluginResolver } from '@stryker-mutator/api/plugin';
import { tokens } from 'typed-inject';
import { coreTokens } from '../di';
import { PluginCreator } from '../di/PluginCreator';

/**
 * Class that applies all config editor plugins
 */
export class ConfigEditorApplier implements ConfigEditor {
  public static inject = tokens(commonTokens.pluginResolver, coreTokens.pluginCreatorConfigEditor);

  constructor(private readonly pluginResolver: PluginResolver, private readonly pluginCreator: PluginCreator<PluginKind.ConfigEditor>) {}

  public edit(config: Config): void {
    this.pluginResolver.resolveAll(PluginKind.ConfigEditor).forEach(plugin => {
      const configEditor = this.pluginCreator.create(plugin.name);
      configEditor.edit(config);
    });
  }
}
