import { TranspilerOptions, Transpiler, TranspileResult, FileLocation } from 'stryker-api/transpile';
import { File } from 'stryker-api/core';
import WebpackCompiler from './compiler/WebpackCompiler';
import ConfigLoader from './compiler/ConfigLoader';
import { setGlobalLogLevel } from 'log4js';

const DEFAULT_STRYKER_WEBPACK_CONFIG = Object.freeze({ configFile: 'webpack.config.js', silent: true });

export default class WebpackTranspiler implements Transpiler {
  private config: StrykerWebpackConfig;
  private webpackCompiler: WebpackCompiler;

  public constructor(options: TranspilerOptions) {
    setGlobalLogLevel(options.config.logLevel);
    this.config = this.getStrykerWebpackConfig(options.config.webpack);
  }

  public async transpile(files: Array<File>): Promise<TranspileResult> {
    try {
      if (!this.webpackCompiler) {
        // Initialize the webpack compiler with the current directory (process.cwd)
        this.webpackCompiler = new WebpackCompiler(new ConfigLoader().load(this.config));
      }

      this.webpackCompiler.writeFilesToFs(files);
      return this.createSuccessResult(await this.webpackCompiler.emit());
    } catch (err) {
      return this.createErrorResult(`${err.name}: ${err.message}`);
    }
  }

  private getStrykerWebpackConfig(strykerWebpackConfig?: Partial<StrykerWebpackConfig>): StrykerWebpackConfig {
    return Object.assign({}, DEFAULT_STRYKER_WEBPACK_CONFIG, strykerWebpackConfig);
  }

  private createErrorResult(error: string): TranspileResult {
    return {
      error,
      outputFiles: []
    };
  }

  private createSuccessResult(outputFiles: File[]): TranspileResult {
    return {
      error: null,
      outputFiles
    };
  }

  public getMappedLocation(sourceFileLocation: FileLocation): FileLocation {
    // Waiting for a decision on how this is going to be implemented in the future
    // Return a 'Method nog implemented' error for now.
    throw new Error('Method not implemented.');
  }
}

export interface StrykerWebpackConfig {
  configFile: string;
  silent: boolean;
}