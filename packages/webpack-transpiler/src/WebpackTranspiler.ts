import { File, StrykerOptions } from '@stryker-mutator/api/core';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { Transpiler } from '@stryker-mutator/api/transpile';

import { WebpackOptions } from '../src-generated/webpack-transpiler-options';

import ConfigLoader from './compiler/ConfigLoader';
import WebpackCompiler from './compiler/WebpackCompiler';
import { pluginTokens } from './pluginTokens';
import { WebpackTranspilerWithStrykerOptions } from './WebpackTranspilerWithStrykerOptions';

export default class WebpackTranspiler implements Transpiler {
  private readonly config: WebpackOptions;
  private webpackCompiler: WebpackCompiler;

  public static inject = tokens(commonTokens.options, commonTokens.produceSourceMaps, pluginTokens.configLoader);
  constructor(options: StrykerOptions, produceSourceMaps: boolean, private readonly configLoader: ConfigLoader) {
    if (produceSourceMaps) {
      throw new Error(
        `Invalid \`coverageAnalysis\` "${options.coverageAnalysis}" is not supported by the stryker-webpack-transpiler (yet). It is not able to produce source maps yet. Please set it "coverageAnalysis" to "off".`
      );
    }
    this.config = {
      context: process.cwd(),
      ...((options as unknown) as WebpackTranspilerWithStrykerOptions).webpack,
    };
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
}
