import JestConfigLoader from './JestConfigLoader';
import path from 'path';
import fs = require('fs');
import jest from 'jest';

/**
 * The Default config loader will load the Jest configuration using the package.json in the package root
 */
export default class CustomJestConfigLoader implements JestConfigLoader {
  private readonly projectRoot: string;

  constructor(projectRoot: string, private readonly loader: NodeRequireFunction = require) {
    this.projectRoot = projectRoot;
  }

  public loadConfig(): jest.Configuration {
    const jestConfig = this.readConfigFromJestConfigFile() || this.readConfigFromPackageJson() || {};
    return jestConfig;
  }

  private readConfigFromJestConfigFile() {
    try {
      return this.loader(path.join(this.projectRoot, 'jest.config.js'));
    } catch { /* Don't return anything (implicitly return undefined) */ }
  }

  private readConfigFromPackageJson() {
    try {
      return JSON.parse(fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8')).jest;
    } catch { /* Don't return anything (implicitly return undefined) */ }
  }
}
