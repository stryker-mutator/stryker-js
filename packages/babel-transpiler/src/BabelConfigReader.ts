import * as fs from 'fs';
import * as path from 'path';
import { StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';
import { tokens, COMMON_TOKENS } from '@stryker-mutator/api/plugin';
import * as babel from './helpers/babelWrapper';
export interface StrykerBabelConfig {
  extensions: ReadonlyArray<string>;
  options: babel.TransformOptions;
  optionsFile: string | null;
  optionsApi?: Partial<babel.ConfigAPI>;
}

export const CONFIG_KEY = 'babel';
export const FILE_KEY: keyof StrykerBabelConfig = 'optionsFile';
export const OPTIONS_KEY: keyof StrykerBabelConfig = 'options';
export const EXTENSIONS_KEY: keyof StrykerBabelConfig = 'extensions';

const defaultBabelConfig: Readonly<StrykerBabelConfig> = Object.freeze({
  extensions: Object.freeze([]),
  options: Object.freeze({}),
  optionsFile: '.babelrc'
});

export class BabelConfigReader {

  public static inject = tokens(COMMON_TOKENS.logger);
  constructor(private readonly log: Logger) {
  }

  public readConfig(strykerOptions: StrykerOptions): StrykerBabelConfig {
    const babelConfig: StrykerBabelConfig = {
      ...defaultBabelConfig,
      ...strykerOptions[CONFIG_KEY]
    };
    babelConfig.options = {
      ...this.readBabelOptionsFromFile(babelConfig.optionsFile, babelConfig.optionsApi),
      ...babelConfig.options
    };
    this.log.debug(`Babel config is: ${JSON.stringify(babelConfig, null, 2)}`);
    return babelConfig;
  }

  private readBabelOptionsFromFile(relativeFileName: string | null, optionsApi?: Partial<babel.ConfigAPI>): babel.TransformOptions {
    if (relativeFileName) {
      const babelrcPath = path.resolve(relativeFileName);
      this.log.debug(`Reading .babelrc file from path "${babelrcPath}"`);
      if (fs.existsSync(babelrcPath)) {
        try {
          if (path.basename(babelrcPath) === '.babelrc.js') {
            return require(babelrcPath) as babel.TransformOptions;
          }
          if (path.basename(babelrcPath) === 'babel.config.js') {
            const config: babel.ConfigFunction = require(babelrcPath);
            return config(optionsApi as babel.ConfigAPI);
          }
          return JSON.parse(fs.readFileSync(babelrcPath, 'utf8')) as babel.TransformOptions;
        } catch (error) {
          this.log.error(`Error while reading "${babelrcPath}" file: ${error}`);
        }
      } else {
        this.log.error(`babelrc file does not exist at: ${babelrcPath}`);
      }
    }
    return {};
  }
}
