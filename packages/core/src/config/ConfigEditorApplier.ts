import { Config, ConfigEditor } from '@stryker-mutator/api/config';
import { tokens } from 'typed-inject';
import { PluginResolver, PluginKind, COMMON_TOKENS } from '@stryker-mutator/api/plugin';
import { PluginCreator } from '../di/PluginCreator';
import { coreTokens } from '../di';

/**
 * Class that applies all config editor plugins
 */
export class ConfigEditorApplier implements ConfigEditor {

  public static inject = tokens(COMMON_TOKENS.pluginResolver, coreTokens.PluginCreatorConfigEditor);

  constructor(private readonly pluginResolver: PluginResolver,
              private readonly pluginCreator: PluginCreator<PluginKind.ConfigEditor>) { }

  public edit(config: Config): void {
    this.pluginResolver.resolveAll(PluginKind.ConfigEditor).forEach(plugin => {
      const configEditor = this.pluginCreator.create(plugin.name);
      configEditor.edit(config);
    });
  }
}
