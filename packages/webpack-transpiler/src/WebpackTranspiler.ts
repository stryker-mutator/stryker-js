import { File, StrykerOptions } from '@stryker-mutator/api/core';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { Transpiler } from '@stryker-mutator/api/transpile';
import ConfigLoader from './compiler/ConfigLoader';
import WebpackCompiler from './compiler/WebpackCompiler';
import { pluginTokens } from './pluginTokens';

const DEFAULT_STRYKER_WEBPACK_CONFIG = Object.freeze({ configFile: undefined, silent: true, context: process.cwd() });

export default class WebpackTranspiler implements Transpiler {
  private readonly config: StrykerWebpackConfig;
  private webpackCompiler: WebpackCompiler;

  public static inject = tokens(commonTokens.options, commonTokens.produceSourceMaps, pluginTokens.configLoader);
  constructor(options: StrykerOptions, produceSourceMaps: boolean, private readonly configLoader: ConfigLoader) {
    if (produceSourceMaps) {
      throw new Error(
        `Invalid \`coverageAnalysis\` "${options.coverageAnalysis}" is not supported by the stryker-webpack-transpiler (yet). It is not able to produce source maps yet. Please set it "coverageAnalysis" to "off".`
      );
    }
    this.config = this.getStrykerWebpackConfig(options.webpack);
  }

  public async transpile(files: readonly File[]): Promise<readonly File[]> {
    if (!this.webpackCompiler) {
      // Initialize the webpack compiler with the current directory (process.cwd)
      const config = await this.configLoader.load(this.config);
      this.webpackCompiler = new WebpackCompiler(config);
    }

    this.webpackCompiler.writeFilesToFs(files);
    const outputFiles = await this.webpackCompiler.emit();
    return [...files, ...outputFiles];
  }

  private getStrykerWebpackConfig(strykerWebpackConfig?: Partial<StrykerWebpackConfig>): StrykerWebpackConfig {
    return Object.assign({}, DEFAULT_STRYKER_WEBPACK_CONFIG, strykerWebpackConfig);
  }
}

export interface StrykerWebpackConfig {
  configFile?: string;
  silent: boolean;
  configFileArgs?: any[];
  // TODO: Remove this when stryker implements projectRoot, see https://github.com/stryker-mutator/stryker/issues/650 */
  context?: string;
}
