import { commonTokens, PluginKind, PluginResolver } from '@stryker-mutator/api/plugin';
import { tokens } from 'typed-inject';
import { StrykerOptions } from '@stryker-mutator/api/core';
import { OptionsEditor } from '@stryker-mutator/api/src/core/OptionsEditor';

import { coreTokens } from '../di';
import { PluginCreator } from '../di/PluginCreator';

import { createConfig } from './createConfig';

/**
 * Class that applies all config editor plugins
 */
export class OptionsEditorApplier implements OptionsEditor {
  public static inject = tokens(commonTokens.pluginResolver, coreTokens.pluginCreatorConfigEditor, coreTokens.pluginCreatorOptionsEditor);

  constructor(
    private readonly pluginResolver: PluginResolver,
    private readonly configEditorPluginCreator: PluginCreator<PluginKind.ConfigEditor>,
    private readonly optionsEditorPluginCreator: PluginCreator<PluginKind.OptionsEditor>
  ) {}

  public edit(options: StrykerOptions): void {
    this.pluginResolver.resolveAll(PluginKind.OptionsEditor).map(plugin => {
      const optionsEditor = this.optionsEditorPluginCreator.create(plugin.name);
      optionsEditor.edit(options);
    });

    // Deprecated "config editors"
    const configEditors = this.pluginResolver.resolveAll(PluginKind.ConfigEditor);
    if (configEditors.length) {
      const config = createConfig(options);
      configEditors.forEach(plugin => {
        const configEditor = this.configEditorPluginCreator.create(plugin.name);
        configEditor.edit(config);
      });
    }
  }
}
