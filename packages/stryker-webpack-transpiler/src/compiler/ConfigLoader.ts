import * as path from 'path';
import { Configuration } from 'webpack';
import { StrykerWebpackConfig } from '../WebpackTranspiler';
import { getLogger, Logger } from 'log4js';

const PROGRESS_PLUGIN_NAME = 'ProgressPlugin';

export default class ConfigLoader {
  private log: Logger;
  private loader: NodeRequireFunction;

  public constructor(loader?: NodeRequireFunction) {
    this.loader = loader || require;
    this.log = getLogger(ConfigLoader.name)
  }

  public load(config: StrykerWebpackConfig): Configuration {
    let webpackConfig: Configuration;

    try {
      webpackConfig = this.loader(path.resolve(config.configFile));
      if (config.silent) {
        this.configureSilent(webpackConfig);
      }
    } catch (err) {
      this.log.debug('Webpack config "%s" not found, trying Webpack 4 zero config', config.configFile);
      webpackConfig = { context: config.context };
    }

    return webpackConfig;
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
