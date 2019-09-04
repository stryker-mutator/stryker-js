import fs = require('fs');
import jest from 'jest';
import path from 'path';
import JestConfigLoader from './JestConfigLoader';

/**
 * The Default config loader will load the Jest configuration using the package.json in the package root
 */
export default class CustomJestConfigLoader implements JestConfigLoader {
  private readonly _projectRoot: string;

  constructor(projectRoot: string, private readonly _loader: NodeRequireFunction = require) {
    this._projectRoot = projectRoot;
  }

  public loadConfig(): jest.Configuration {
    const jestConfig = this.readConfigFromJestConfigFile() || this.readConfigFromPackageJson() || {};
    return jestConfig;
  }

  private readConfigFromJestConfigFile() {
    try {
      return this._loader(path.join(this._projectRoot, 'jest.config.js'));
    } catch { /* Don't return anything (implicitly return undefined) */ }
  }

  private readConfigFromPackageJson() {
    try {
      return JSON.parse(fs.readFileSync(path.join(this._projectRoot, 'package.json'), 'utf8')).jest;
    } catch { /* Don't return anything (implicitly return undefined) */ }
  }
}
