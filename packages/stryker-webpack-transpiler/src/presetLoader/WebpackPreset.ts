import { Configuration } from 'webpack';
import { TextFile } from 'stryker-api/core';

export default interface WebpackPreset {
  /**
   * Returns the actual webpack configuration file that is needed by Webpack to transpile and bundle the project
   */
  getWebpackConfig(projectRoot: string, configLocation?: string): Configuration;

  /**
   * Returns all extra files that are necessary for Webpack to transpile and bundle a project
   */
  getInitFiles(projectRoot: string): Array<TextFile>;
}