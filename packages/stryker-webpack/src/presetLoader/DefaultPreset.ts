import WebpackPreset from './WebpackPreset';
import { Configuration } from 'webpack';
import { TextFile } from 'stryker-api/core';
import * as path from 'path';

export default class DefaultPreset implements WebpackPreset {
  private loader: NodeRequire;

  public constructor(loader?: NodeRequire) {
    this.loader = loader || /* istanbul ignore next */ require;
  }

  public getWebpackConfig(projectRoot: string, webpackConfigLocation?: string): Configuration {
    try {
      return this.getWebpackConfigFromProjectRoot(projectRoot, webpackConfigLocation);
    } catch {
      return this.generateDefaultWebpackConfig(projectRoot);
    }
  }

  private getWebpackConfigFromProjectRoot(projectRoot: string, webpackConfigLocation?: string): Configuration {
    webpackConfigLocation = webpackConfigLocation || 'webpack.config.js';

    return this.loader(path.join(projectRoot, webpackConfigLocation));
  }

  private generateDefaultWebpackConfig(projectRoot: string): Configuration {
    return {
      entry: [path.join(projectRoot, "src", "main.js")],

      output: {
        path: path.join(projectRoot, "dist"),
        filename: "bundle.js"
      }
    };
  }

  public getInitFiles(projectRoot: string): Array<TextFile> {
    // No init files, just return empty array
    return [];
  }
}