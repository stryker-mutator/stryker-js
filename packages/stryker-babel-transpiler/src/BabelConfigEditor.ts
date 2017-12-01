import * as fs from 'fs';
import * as path from 'path';
import { Config } from 'stryker-api/config';
import { CONFIG_KEY_FILE, CONFIG_KEY_OPTIONS } from './helpers/keys';
import { getLogger } from 'log4js';

export default class BabelConfigEditor {
  private readonly log = getLogger(BabelConfigEditor.name);

  public readConfig(config: Config): babel.TransformOptions {
    let babelrc = config[CONFIG_KEY_OPTIONS] || this.getConfigFile(config) || {};
    this.log.trace(`babel config is: ${JSON.stringify(config[CONFIG_KEY_OPTIONS])}`);
    return babelrc;
  }

  private getConfigFile(config: Config) {
    if (typeof config[CONFIG_KEY_FILE] === 'string') {
      const babelrcPath = path.resolve(config[CONFIG_KEY_FILE]);
      this.log.info(`Reading .babelrc file from path "${babelrcPath}"`);
      if (fs.existsSync(babelrcPath)) {
        try {
          let configFile = fs.readFileSync(babelrcPath, 'utf8');
          return JSON.parse(configFile);
        } catch (error) {
          this.log.error(`Error while reading .babelrc file: ${error}`);
        }
      } else {
        this.log.error(`babelrc file does not exist at: ${babelrcPath}`);
      }
    } else {
      this.log.info(`No .babelrc file configured. Please set the "${CONFIG_KEY_FILE}" property in your config.`);
    }
  }
}