import * as fs from 'fs';
import * as path from 'path';
import { ConfigEditor, Config } from 'stryker-api/config';
import { CONFIG_KEY_FILE, CONFIG_KEY_OPTIONS } from './helpers/keys';
import { getLogger } from 'log4js';

export default class BabelConfigEditor implements ConfigEditor {
  private readonly log = getLogger(BabelConfigEditor.name);

  public edit(config: Config) {
    config[CONFIG_KEY_OPTIONS] = config[CONFIG_KEY_OPTIONS] || this.readConfig(config) || {};
    this.log.trace(`babelConfig set to: ${JSON.stringify(config[CONFIG_KEY_OPTIONS])}`);
  }

  private readConfig(config: Config) {
    if (typeof config[CONFIG_KEY_FILE] === 'string') {
      const babelrcPath = path.resolve(config[CONFIG_KEY_FILE]);
      this.log.info(`Reading .babelrc file from path "${babelrcPath}"`);
      try {
        return JSON.parse(fs.readFileSync(babelrcPath, 'utf8'));
      } catch (error) {
        this.log.error(`Error while reading .babelrc file: ${JSON.stringify(error)}`);
      }
    } else {
      this.log.warn(`No .babelrc file configured. Please set the "${CONFIG_KEY_FILE}" property in your config.`);
    }
  }
}