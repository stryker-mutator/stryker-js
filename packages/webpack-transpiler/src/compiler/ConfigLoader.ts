import * as path from 'path';
import * as fs from 'fs';
import { Configuration } from 'webpack';
import { StrykerWebpackConfig } from '../WebpackTranspiler';
import { isFunction } from 'lodash';
import { tokens, COMMON_TOKENS } from '@stryker-mutator/api/plugin';
import { Logger } from '@stryker-mutator/api/logging';
import { PLUGIN_TOKENS } from '../pluginTokens';

const progressPluginName = 'ProgressPlugin';

export default class ConfigLoader {
  public static inject = tokens(COMMON_TOKENS.logger, PLUGIN_TOKENS.require);
  public constructor(private readonly log: Logger, private readonly requireFn: NodeRequireFunction) {
  }

  public async load(config: StrykerWebpackConfig): Promise<Configuration> {
    let webpackConfig: Configuration;

    if (config.configFile) {
      webpackConfig = await this.loadWebpackConfigFromProjectRoot(config.configFile);
      if (isFunction(webpackConfig)) {
        webpackConfig = webpackConfig.apply(null, config.configFileArgs);
      }
      if (config.silent) {
        this.configureSilent(webpackConfig);
      }
    } else {
      this.log.debug('Webpack config "%s" not found, trying Webpack 4 zero config', config.configFile);
      webpackConfig = { context: config.context };
    }

    return webpackConfig;
  }

  private loadWebpackConfigFromProjectRoot(configFileLocation: string) {
    const resolvedName = path.resolve(configFileLocation);

    if (!fs.existsSync(resolvedName)) {
      throw new Error(`Could not load webpack config at "${resolvedName}", file not found.`);
    }

    return this.requireFn(resolvedName);
  }

  private configureSilent(webpackConfig: Configuration) {
    if (webpackConfig.plugins) {
      webpackConfig.plugins = webpackConfig.plugins.filter(plugin => {
        if (plugin.constructor && plugin.constructor.name === progressPluginName) {
          this.log.debug('Removing webpack plugin "%s" to keep webpack bundling silent. Set `webpack: { silent: false }` in your stryker.conf.js file to disable this feature.', progressPluginName);
          return false;
        } else {
          return true;
        }
      });
    }
  }
}
