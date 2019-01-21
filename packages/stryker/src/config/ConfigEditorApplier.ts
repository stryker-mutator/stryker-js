import { Config, ConfigEditor } from 'stryker-api/config';
import { tokens } from 'typed-inject';
import { PluginResolver, PluginKind, commonTokens } from 'stryker-api/plugin';
import { PluginCreator } from '../di/PluginCreator';
import * as coreTokens from '../di/coreTokens';

/**
 * Class that applies all config editor plugins
 */
export class ConfigEditorApplier implements ConfigEditor {

  public static inject = tokens(commonTokens.pluginResolver, coreTokens.pluginCreator);

  constructor(private readonly pluginResolver: PluginResolver,
              private readonly pluginCreator: PluginCreator<PluginKind.ConfigEditor>) { }

  public edit(config: Config): void {
    this.pluginResolver.resolveAll(PluginKind.ConfigEditor).forEach(plugin => {
      const configEditor = this.pluginCreator.create(plugin.name);
      configEditor.edit(config);
    });
  }
}
