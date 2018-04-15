import * as fs from 'fs';
import * as path from 'path';
import { Config } from 'stryker-api/config';
import { CONFIG_KEY_FILE, CONFIG_KEY_OPTIONS } from './helpers/keys';
import { getLogger, setGlobalLogLevel } from 'log4js';

export default class BabelConfigReader {
  private readonly log = getLogger(BabelConfigReader.name);

  public readConfig(config: Config): babel.TransformOptions {
    setGlobalLogLevel(config.logLevel);
    const babelConfig: babel.TransformOptions = config[CONFIG_KEY_OPTIONS] || this.getConfigFile(config) || {};
    this.log.debug(`babel config is: ${JSON.stringify(babelConfig, null, 2)}`);
    return babelConfig;
  }

  private getConfigFile(config: Config): babel.TransformOptions | null {
    if (typeof config[CONFIG_KEY_FILE] === 'string') {
      const babelrcPath = path.resolve(config[CONFIG_KEY_FILE]);
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