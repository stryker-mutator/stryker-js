import * as fs from 'fs';
import * as path from 'path';
import { CONFIG_KEY_FILE, CONFIG_KEY_OPTIONS } from './helpers/keys';
import { StrykerOptions } from 'stryker-api/core';
import { Logger } from 'stryker-api/logging';
import { tokens, commonTokens } from 'stryker-api/plugin';

export default class BabelConfigReader {

  public static inject = tokens(commonTokens.logger);
  constructor(private readonly log: Logger) { }

  public readConfig(options: StrykerOptions): babel.TransformOptions {
    const babelConfig: babel.TransformOptions = options[CONFIG_KEY_OPTIONS] || this.getConfigFile(options) || {};
    this.log.debug(`babel config is: ${JSON.stringify(babelConfig, null, 2)}`);
    return babelConfig;
  }

  private getConfigFile(options: StrykerOptions): babel.TransformOptions | null {
    if (typeof options[CONFIG_KEY_FILE] === 'string') {
      const babelrcPath = path.resolve(options[CONFIG_KEY_FILE]);
      this.log.info(`Reading .babelrc file from path "${babelrcPath}"`);
      if (fs.existsSync(babelrcPath)) {
        try {
          const config: babel.TransformOptions = JSON.parse(fs.readFileSync(babelrcPath, 'utf8'));
          return config;
        } catch (error) {
          this.log.error(`Error while reading .babelrc file: ${error}`);
        }
      } else {
        this.log.error(`babelrc file does not exist at: ${babelrcPath}`);
      }
    } else {
      this.log.info(`No .babelrc file configured. Please set the "${CONFIG_KEY_FILE}" property in your config.`);
    }
    return null;
  }
}
