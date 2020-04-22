import * as path from 'path';

import { File, StrykerOptions } from '@stryker-mutator/api/core';
import { commonTokens, Injector, tokens, TranspilerPluginContext } from '@stryker-mutator/api/plugin';
import { Transpiler } from '@stryker-mutator/api/transpile';
import { StrykerError } from '@stryker-mutator/util';

import { BabelConfigReader, StrykerBabelConfig } from './BabelConfigReader';
import * as babel from './helpers/babelWrapper';
import { toJSFileName } from './helpers/helpers';

const DEFAULT_EXTENSIONS: readonly string[] = babel.DEFAULT_EXTENSIONS;

export function babelTranspilerFactory(injector: Injector<TranspilerPluginContext>) {
  return injector.provideClass('babelConfigReader', BabelConfigReader).injectClass(BabelTranspiler);
}
babelTranspilerFactory.inject = tokens(commonTokens.injector);

export class BabelTranspiler implements Transpiler {
  private readonly babelConfig: StrykerBabelConfig;
  private readonly projectRoot: string;
  private readonly extensions: readonly string[];

  public static inject = tokens(commonTokens.options, commonTokens.produceSourceMaps, 'babelConfigReader');
  constructor(options: StrykerOptions, produceSourceMaps: boolean, babelConfigReader: BabelConfigReader) {
    if (produceSourceMaps) {
      throw new Error(
        `Invalid \`coverageAnalysis\` "${options.coverageAnalysis}" is not supported by the stryker-babel-transpiler. Not able to produce source maps yet. Please set it to "off".`
      );
    }
    this.babelConfig = babelConfigReader.readConfig(options);
    this.projectRoot = this.determineProjectRoot();
    this.extensions = [...DEFAULT_EXTENSIONS, ...this.babelConfig.extensions];
  }

  public async transpile(files: readonly File[]): Promise<readonly File[]> {
    return files.map(file => this.transpileFileIfNeeded(file));
  }

  private transpileFileIfNeeded(file: File): File {
    if (this.extensions.some(ext => ext === path.extname(file.name))) {
      try {
        return this.transpileFile(file);
      } catch (error) {
        throw new StrykerError(`Error while transpiling "${file.name}"`, error);
      }
    } else {
      return file; // pass through
    }
  }

  private transpileFile(file: File) {
    const relativeOptions: babel.TransformOptions = {
      cwd: this.projectRoot,
      filename: file.name,
      filenameRelative: path.relative(this.projectRoot, file.name)
    };
    const options: babel.TransformOptions = { ...this.babelConfig.options, ...relativeOptions };
    const result: babel.BabelFileResult | null = babel.transformSync(file.textContent, options);
    if (!result) {
      // File is ignored by babel
      return file;
    } else if (result.code === undefined || result.code === null) {
      throw new Error(`Could not transpile file "${file.name}". Babel transform function delivered \`undefined\`.`);
    } else {
      return new File(toJSFileName(file.name), result.code);
    }
  }

  private determineProjectRoot(): string {
    const configFile = this.babelConfig.optionsFile;
    if (configFile) {
      return path.dirname(configFile);
    } else {
      return process.cwd();
    }
  }
}
