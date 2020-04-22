import * as fs from 'fs';
import * as path from 'path';

import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';

import { StrykerBabelConfig } from '../src-generated/babel-transpiler-options';

import * as babel from './helpers/babelWrapper';
import { BabelTranspilerWithStrykerOptions } from './BabelTranspilerWithStrykerOptions';

export class BabelConfigReader {
  public static inject = tokens(commonTokens.logger);
  constructor(private readonly log: Logger) {}

  public readConfig(strykerOptions: BabelTranspilerWithStrykerOptions): StrykerBabelConfig {
    const babelConfig = { ...strykerOptions.babel };
    babelConfig.options = {
      ...this.readBabelOptionsFromFile(babelConfig.optionsFile),
      ...babelConfig.options,
    };
    this.log.debug(`Babel config is: ${JSON.stringify(babelConfig, null, 2)}`);
    return babelConfig;
  }

  private readBabelOptionsFromFile(relativeFileName: string | null): babel.TransformOptions {
    if (relativeFileName) {
      const babelrcPath = path.resolve(relativeFileName);
      this.log.debug(`Reading .babelrc file from path "${babelrcPath}"`);
      if (fs.existsSync(babelrcPath)) {
        try {
          if (path.basename(babelrcPath) === '.babelrc.js') {
            return require(babelrcPath) as babel.TransformOptions;
          }
          if (path.basename(babelrcPath) === 'babel.config.js') {
            const config = require(babelrcPath);
            if (typeof config === 'function') {
              const configFunction = config as babel.ConfigFunction;
              return configFunction();
            } else {
              return config as babel.TransformOptions;
            }
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
