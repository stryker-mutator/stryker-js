import { File } from 'stryker-api/core';
import { Transpiler, TranspilerOptions } from 'stryker-api/transpile';
import ConfigLoader from './compiler/ConfigLoader';
import WebpackCompiler from './compiler/WebpackCompiler';

const DEFAULT_STRYKER_WEBPACK_CONFIG = Object.freeze({ configFile: undefined, silent: true, context: process.cwd() });

export default class WebpackTranspiler implements Transpiler {
  private readonly config: StrykerWebpackConfig;
  private webpackCompiler: WebpackCompiler;

  public constructor(options: TranspilerOptions) {
    if (options.produceSourceMaps) {
      throw new Error(`Invalid \`coverageAnalysis\` "${options.config.coverageAnalysis}" is not supported by the stryker-webpack-transpiler (yet). It is not able to produce source maps yet. Please set it "coverageAnalysis" to "off".`);
    }
    this.config = this.getStrykerWebpackConfig(options.config.webpack);
  }

  public async transpile(files: ReadonlyArray<File>): Promise<ReadonlyArray<File>> {
    if (!this.webpackCompiler) {
      // Initialize the webpack compiler with the current directory (process.cwd)
      const config = await new ConfigLoader().load(this.config);
      this.webpackCompiler = new WebpackCompiler(config);
    }

    this.webpackCompiler.writeFilesToFs(files);
    const outputFiles = await this.webpackCompiler.emit();

    return [...files, ...outputFiles];
  }

  private getStrykerWebpackConfig(strykerWebpackConfig?: Partial<StrykerWebpackConfig>): StrykerWebpackConfig {
    return {...DEFAULT_STRYKER_WEBPACK_CONFIG, ...strykerWebpackConfig};
  }
}

export interface StrykerWebpackConfig {
  configFile?: string;
  configFileArgs?: any[];
  // TODO: Remove this when stryker implements projectRoot, see https://github.com/stryker-mutator/stryker/issues/650 */
  context?: string;
  silent: boolean;
}
