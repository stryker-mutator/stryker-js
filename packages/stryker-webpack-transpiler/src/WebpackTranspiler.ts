import { TranspilerOptions, Transpiler, TranspileResult, FileLocation } from 'stryker-api/transpile';
import { Config } from 'stryker-api/config';
import { File, TextFile } from 'stryker-api/core';
import PresetLoader from './presetLoader/PresetLoader';
import WebpackCompiler from './compiler/WebpackCompiler';
import WebpackPreset from './presetLoader/WebpackPreset';

class WebpackTranspiler implements Transpiler {
  private config: Config;
  private presetLoader: PresetLoader;
  private webpackCompiler: WebpackCompiler;

  public constructor(options: TranspilerOptions) {
    this.config = options.config;
    this.presetLoader = new PresetLoader;
  }

  public async transpile(files: Array<File>): Promise<TranspileResult> {
    try {
      if (!this.webpackCompiler) {
        // Initialize the webpack compiler with the current directory (process.cwd)
        await this.initialize(process.cwd(), this.config.webpack);
      }

      await this.webpackCompiler.writeFilesToFs(files as Array<TextFile>);

      return this.createSuccessResult(await this.webpackCompiler.emit());
    } catch (err) {
      return this.createErrorResult(`${err.name}: ${err.message}`);
    }
  }

  private async initialize(projectRoot: string, strykerWebpackConfig?: StrykerWebpackConfig): Promise<void> {
    strykerWebpackConfig = this.getStrykerWebpackConfig(strykerWebpackConfig);

    await this.initializeCompiler(projectRoot, strykerWebpackConfig);
  }

  private getStrykerWebpackConfig(strykerWebpackConfig?: StrykerWebpackConfig): StrykerWebpackConfig {
    return {
      project: (strykerWebpackConfig && strykerWebpackConfig.project) ? strykerWebpackConfig.project : 'default',
      configLocation: (strykerWebpackConfig && strykerWebpackConfig.configLocation) ? strykerWebpackConfig.configLocation : undefined
    };
  }

  private async initializeCompiler(projectRoot: string, strykerWebpackConfig: StrykerWebpackConfig): Promise<void> {
    const preset: WebpackPreset = this.presetLoader.loadPreset(strykerWebpackConfig.project.toLowerCase());

    this.webpackCompiler = new WebpackCompiler(preset.getWebpackConfig(projectRoot, strykerWebpackConfig.configLocation));

    // Push the init files to the file system with the replace function
    await this.webpackCompiler.writeFilesToFs(preset.getInitFiles(projectRoot));
  }

  private createErrorResult(error: string): TranspileResult {
    return {
      error,
      outputFiles: []
    };
  }

  private createSuccessResult(outPutFiles: File[]): TranspileResult {
    return {
      error: null,
      outputFiles: outPutFiles
    };
  }

  public getMappedLocation(sourceFileLocation: FileLocation): FileLocation {
    // Waiting for a decision on how this is going to be implemented in the future
    // Return a 'Method nog implemented' error for now.
    throw new Error('Method not implemented.');
  }
}

interface StrykerWebpackConfig {
  project: string;
  configLocation?: string;
}

export default WebpackTranspiler;