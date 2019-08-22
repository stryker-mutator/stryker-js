import jest from 'jest';
import * as path from 'path';
import { createReactTsJestConfig } from '../utils/createReactJestConfig';
import JestConfigLoader from './JestConfigLoader';

export default class ReactScriptsTSJestConfigLoader implements JestConfigLoader {
  private readonly loader: NodeRequire;
  private readonly projectRoot: string;

  public constructor(projectRoot: string, loader?: NodeRequire) {
    this.loader = loader || /* istanbul ignore next */ require;
    this.projectRoot = projectRoot;
  }

  public loadConfig(): jest.Configuration {
    // Get the location of react-ts script, this is later used to generate the Jest configuration used for React projects.
    const reactScriptsTsLocation = path.join(this.loader.resolve('react-scripts-ts/package.json'), '..');

    // Create the React configuration for Jest
    const jestConfiguration = this.createJestConfig(reactScriptsTsLocation);

    // Set test environment to jsdom (otherwise Jest won't run)
    jestConfiguration.testEnvironment = 'jsdom';

    return jestConfiguration;
  }

  private createJestConfig(reactScriptsTsLocation: string): jest.Configuration {
    return createReactTsJestConfig(
      (relativePath: string): string => path.join(reactScriptsTsLocation, relativePath),
      this.projectRoot,
      false
    );
  }
}
