import * as fs from 'fs';
import * as path from 'path';
import { getLogger } from 'stryker-api/logging';
import { StrykerOptions } from 'stryker-api/core';
import * as babel from './helpers/babelWrapper';
export interface StrykerBabelConfig {
  extensions: ReadonlyArray<string>;
  options: babel.TransformOptions;
  optionsFile: string | null;
}

export const DEPRECATED_CONFIG_KEY_FILE = 'babelrcFile';
export const DEPRECATED_CONFIG_KEY_OPTIONS = 'babelConfig';
export const CONFIG_KEY = 'babel';
export const FILE_KEY: keyof StrykerBabelConfig = 'optionsFile';
export const OPTIONS_KEY: keyof StrykerBabelConfig = 'options';
export const EXTENSIONS_KEY: keyof StrykerBabelConfig = 'extensions';

const DEFAULT_BABEL_CONFIG: Readonly<StrykerBabelConfig> = Object.freeze({
  extensions: Object.freeze([]),
  options: Object.freeze({}),
  optionsFile: '.babelrc'
});

export class BabelConfigReader {
  private readonly log = getLogger(BabelConfigReader.name);

  public readConfig(strykerOptions: StrykerOptions): StrykerBabelConfig {
    const babelConfig: StrykerBabelConfig = {
      ...DEFAULT_BABEL_CONFIG,
      ...strykerOptions[CONFIG_KEY]
    };
    this.loadDeprecatedOptions(strykerOptions, babelConfig);
    babelConfig.options = {
      ...this.readBabelOptionsFromFile(babelConfig.optionsFile),
      ...babelConfig.options
    };
    this.log.debug(`Babel config is: ${JSON.stringify(babelConfig, null, 2)}`);
    return babelConfig;
  }

  private loadDeprecatedOptions(strykerOptions: StrykerOptions, babelConfig: StrykerBabelConfig) {
    if (strykerOptions[DEPRECATED_CONFIG_KEY_OPTIONS]) {
      babelConfig.options = strykerOptions[DEPRECATED_CONFIG_KEY_OPTIONS];
      this.log.warn(`"${DEPRECATED_CONFIG_KEY_OPTIONS}" is deprecated, please use { ${CONFIG_KEY}: { ${OPTIONS_KEY}: ${JSON.stringify(babelConfig.options)} }`);
    }
    if (strykerOptions[DEPRECATED_CONFIG_KEY_FILE]) {
      babelConfig.optionsFile = strykerOptions[DEPRECATED_CONFIG_KEY_FILE];
      this.log.warn(`"${DEPRECATED_CONFIG_KEY_FILE}" is deprecated, please use { ${CONFIG_KEY}: { ${FILE_KEY}: '${babelConfig.optionsFile}' } }`);
    }
  }

  private readBabelOptionsFromFile(relativeFileName: string | null): babel.TransformOptions {
    if (relativeFileName) {
      const babelrcPath = path.resolve(relativeFileName);
      this.log.debug(`Reading .babelrc file from path "${babelrcPath}"`);
      if (fs.existsSync(babelrcPath)) {
        try {
          const config: babel.TransformOptions = JSON.parse(fs.readFileSync(babelrcPath, 'utf8'));
          return config;
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
