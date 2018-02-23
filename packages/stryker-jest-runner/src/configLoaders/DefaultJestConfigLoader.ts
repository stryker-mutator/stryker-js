import JestConfigLoader from './JestConfigLoader';
import * as path from 'path';
import JestConfiguration from './JestConfiguration';

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

  public loadConfig(): JestConfiguration {
    let jestConfig: JestConfiguration;
    
    try {
      jestConfig = this.readConfigFromJestConfigFile();
    } catch {
      jestConfig = JSON.parse(this.readConfigFromPackageJson()).jest;
    }

    if (!jestConfig) {
      throw new Error('No Jest configuration found in your projectroot, please supply a jest.config.js or a jest config in your package.json');
    }

    return jestConfig;
  }

  private readConfigFromJestConfigFile() {
    return this._loader(path.join(this._projectRoot, 'jest.config.js'));
  }

  private readConfigFromPackageJson() {
    return this._fs.readFileSync(path.join(this._projectRoot, 'package.json'), 'utf8');
  }
}