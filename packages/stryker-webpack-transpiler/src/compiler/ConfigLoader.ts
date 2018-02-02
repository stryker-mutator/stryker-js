import * as path from 'path';
import { Configuration } from 'webpack';
import { StrykerWebpackConfig } from '../WebpackTranspiler';
import { getLogger } from 'log4js';

const PROGRESS_PLUGIN_NAME = 'ProgressPlugin';

export default class ConfigLoader {
  private log = getLogger(ConfigLoader.name);

  public constructor(private loader: NodeRequireFunction = require) {
  }

  public load(config: StrykerWebpackConfig): Configuration {
    const webpackConfig: Configuration = this.loader(path.resolve(config.configFile));
    if (config.silent) {
      this.configureSilent(webpackConfig);
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
