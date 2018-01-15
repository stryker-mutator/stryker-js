import { TranspilerOptions, Transpiler, TranspileResult, FileLocation } from 'stryker-api/transpile';
import { Config } from 'stryker-api/config';
import { File } from 'stryker-api/core';
import WebpackCompiler from './compiler/WebpackCompiler';
import ConfigLoader from './compiler/ConfigLoader';

export default class WebpackTranspiler implements Transpiler {
  private config: Config;
  private webpackCompiler: WebpackCompiler;

  public constructor(options: TranspilerOptions) {
    this.config = options.config;
  }

  public async transpile(files: Array<File>): Promise<TranspileResult> {
    try {
      if (!this.webpackCompiler) {
        // Initialize the webpack compiler with the current directory (process.cwd)
        await this.initialize(this.config.webpack);
      }

      this.webpackCompiler.writeFilesToFs(files);
      return this.createSuccessResult(await this.webpackCompiler.emit());
    } catch (err) {
      return this.createErrorResult(`${err.name}: ${err.message}`);
    }
  }

  private initialize(strykerWebpackConfig?: StrykerWebpackConfig): void {
    strykerWebpackConfig = this.getStrykerWebpackConfig(strykerWebpackConfig);
    this.webpackCompiler = new WebpackCompiler(new ConfigLoader().load(strykerWebpackConfig.configFile));
  }

  private getStrykerWebpackConfig(strykerWebpackConfig?: Partial<StrykerWebpackConfig>): StrykerWebpackConfig {
    return {
      configFile: (strykerWebpackConfig && strykerWebpackConfig.configFile) || 'webpack.config.js'
    };
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
}