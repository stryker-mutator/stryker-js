import JestConfigLoader from './JestConfigLoader';
import * as path from 'path';
import { Configuration } from 'jest';

/**
 * The Default config loader will load the Jest configuration using the package.json in the package root
 */
export default class DefaultJestConfigLoader implements JestConfigLoader {
  private _fs: any;
  private _projectRoot: string;
  private _loader: NodeRequire;

  constructor(projectRoot: string, fs: any, loader?: NodeRequire) {
    this._projectRoot = projectRoot;
    this._fs = fs;
    this._loader = loader || /* istanbul ignore next */ require;
  }

  public loadConfig(): Configuration {
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
      return JSON.parse(this._fs.readFileSync(path.join(this._projectRoot, 'package.json'), 'utf8')).jest;
    } catch { /* Don't return anything (implicitly return undefined) */ } 
  }
}