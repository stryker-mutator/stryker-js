import { Transpiler } from '@stryker-mutator/api/transpile';
import { File, StrykerOptions } from '@stryker-mutator/api/core';
import WebpackCompiler from './compiler/WebpackCompiler';
import ConfigLoader from './compiler/ConfigLoader';
import { tokens, COMMON_TOKENS } from '@stryker-mutator/api/plugin';
import { PLUGIN_TOKENS } from './pluginTokens';

const defaultStrykerWebpackConfig = Object.freeze({ configFile: undefined, silent: true, context: process.cwd() });

export default class WebpackTranspiler implements Transpiler {
  private readonly config: StrykerWebpackConfig;
  private webpackCompiler: WebpackCompiler;

  public static inject = tokens(COMMON_TOKENS.options, COMMON_TOKENS.produceSourceMaps, PLUGIN_TOKENS.configLoader);
  public constructor(options: StrykerOptions, produceSourceMaps: boolean, private readonly configLoader: ConfigLoader) {
    if (produceSourceMaps) {
      throw new Error(`Invalid \`coverageAnalysis\` "${options.coverageAnalysis}" is not supported by the stryker-webpack-transpiler (yet). It is not able to produce source maps yet. Please set it "coverageAnalysis" to "off".`);
    }
    this.config = this.getStrykerWebpackConfig(options.webpack);
  }

  public async transpile(files: ReadonlyArray<File>): Promise<ReadonlyArray<File>> {
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
    return Object.assign({}, defaultStrykerWebpackConfig, strykerWebpackConfig);
  }
}

export interface StrykerWebpackConfig {
  configFile?: string;
  silent: boolean;
  configFileArgs?: any[];
  // TODO: Remove this when stryker implements projectRoot, see https://github.com/stryker-mutator/stryker/issues/650 */
  context?: string;
}
