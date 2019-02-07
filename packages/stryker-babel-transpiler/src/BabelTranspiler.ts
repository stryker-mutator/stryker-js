import { Transpiler } from 'stryker-api/transpile';
import { File, StrykerOptions } from 'stryker-api/core';
import * as babel from './helpers/babelWrapper';
import * as path from 'path';
import { BabelConfigReader, StrykerBabelConfig } from './BabelConfigReader';
import { toJSFileName } from './helpers/helpers';
import { tokens, commonTokens } from 'stryker-api/plugin';
import { StrykerError } from '@stryker-mutator/util';

const DEFAULT_EXTENSIONS: ReadonlyArray<string> = (babel as any).DEFAULT_EXTENSIONS;

export class BabelTranspiler implements Transpiler {
  private readonly babelConfig: StrykerBabelConfig;
  private readonly projectRoot: string;
  private readonly extensions: ReadonlyArray<string>;

  public static inject = tokens(commonTokens.options, commonTokens.produceSourceMaps);
  public constructor(options: StrykerOptions, produceSourceMaps: boolean) {
    if (produceSourceMaps) {
      throw new Error(`Invalid \`coverageAnalysis\` "${options.coverageAnalysis}" is not supported by the stryker-babel-transpiler. Not able to produce source maps yet. Please set it to "off".`);
    }
    this.babelConfig = new BabelConfigReader().readConfig(options);
    this.projectRoot = this.determineProjectRoot();
    this.extensions = [...DEFAULT_EXTENSIONS, ...this.babelConfig.extensions];
  }

  public async transpile(files: ReadonlyArray<File>): Promise<ReadonlyArray<File>> {
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
