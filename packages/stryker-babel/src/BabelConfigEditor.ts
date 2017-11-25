import * as fs from 'fs';
import * as path from 'path';
import { ConfigEditor, Config } from 'stryker-api/config';
import { babelrcFileConfigKey } from './helpers/keys';
import { getLogger } from 'log4js';

export default class BabelConfigEditor implements ConfigEditor {
  private readonly log = getLogger(BabelConfigEditor.name);

  public edit(config: Config) {
    config.babelConfig = config.babelConfig || this.readConfig(config) || {};
    this.log.trace(`babelConfig set to: ${JSON.stringify(config.babelConfig)}`);
  }

  private readConfig(config: Config) {
    if (typeof config[babelrcFileConfigKey] === 'string') {
      const babelrcPath = path.resolve(config[babelrcFileConfigKey]);
      this.log.info(`Reading .babelrc file from path "${babelrcPath}"`);
      return this.getConfigFile(babelrcPath);
    } else {
      this.log.warn(`No .babelrc file configured. Please set the "${babelrcFileConfigKey}" property in your config.`);
    }
  }

  private getConfigFile(configPath: string) {
    if (fs.existsSync(configPath)) {
      try {
        let configFile = fs.readFileSync(configPath, 'utf8');
        return JSON.parse(configFile);
      } catch (error) {
        this.log.error(`Error while reading .babelrc file: ${error}`);
      }
    }

    else {
      this.log.error(`babelrc file does not exist at: ${configPath}`);
    }
  }
}