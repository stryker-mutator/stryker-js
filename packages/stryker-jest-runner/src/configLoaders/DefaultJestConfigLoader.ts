import JestConfigLoader from './JestConfigLoader';
import * as path from 'path';
import JestConfiguration from './JestConfiguration';

/**
 * The Default config loader will load the Jest configuration using the package.json in the package root
 */
export default class DefaultJestConfigLoader implements JestConfigLoader {
  private _fs: any;
  private _projectRoot: string;

  constructor(projectRoot: string, fs: any) {
    this._projectRoot = projectRoot;
    this._fs = fs;
  }

  public loadConfig(): JestConfiguration {
    const packageJson = this._fs.readFileSync(path.join(this._projectRoot, 'package.json'), 'utf8');

    // Parse the package.json and return the Jest property
    const jestConfig = JSON.parse(packageJson).jest;

    if (!jestConfig) {
      throw new Error('No Jest configuration found in your package.json');
    }

    return jestConfig;
  }
}