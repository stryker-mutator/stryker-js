import WebpackPreset from './WebpackPreset';
import { Configuration } from 'webpack';
import { TextFile } from 'stryker-api/core';
import * as path from 'path';


export default class DefaultPreset implements WebpackPreset {
  public constructor(private loader: NodeRequireFunction = require) {
  }

  public getWebpackConfig(webpackConfigLocation: string = 'webpack.config.js'): Configuration {
      return this.loader(path.resolve(webpackConfigLocation));
  }

  public getInitFiles(): Array<TextFile> {
    // No init files, just return empty array
    return [];
  }
}
