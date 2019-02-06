import * as path from 'path';
import * as fs from 'fs';
import { Configuration } from 'webpack';
import { StrykerWebpackConfig } from '../WebpackTranspiler';
import { isFunction } from 'lodash';
import { tokens, commonTokens } from 'stryker-api/plugin';
import { Logger } from 'stryker-api/logging';
import { pluginTokens } from '../pluginTokens';

const PROGRESS_PLUGIN_NAME = 'ProgressPlugin';

export default class ConfigLoader {
  public static inject = tokens(commonTokens.logger, pluginTokens.require);
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
        if (plugin.constructor && plugin.constructor.name === PROGRESS_PLUGIN_NAME) {
          this.log.debug('Removing webpack plugin "%s" to keep webpack bundling silent. Set `webpack: { silent: false }` in your stryker.conf.js file to disable this feature.', PROGRESS_PLUGIN_NAME);
          return false;
        } else {
          return true;
        }
      });
    }
  }
}
