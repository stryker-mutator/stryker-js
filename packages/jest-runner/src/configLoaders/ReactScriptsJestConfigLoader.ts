import JestConfigLoader from './JestConfigLoader';
import { createReactJestConfig } from '../utils/createReactJestConfig';
import path from 'path';
import jest from 'jest';

export default class ReactScriptsJestConfigLoader implements JestConfigLoader {
  private readonly loader: NodeRequire;
  private readonly projectRoot: string;

  public constructor(projectRoot: string, loader?: NodeRequire) {
    this.loader = loader || /* istanbul ignore next */ require;
    this.projectRoot = projectRoot;
  }

  public loadConfig(): jest.Configuration {
    // Get the location of react script, this is later used to generate the Jest configuration used for React projects.
    const reactScriptsLocation = path.join(this.loader.resolve('react-scripts/package.json'), '..');

    // Create the React configuration for Jest
    const jestConfiguration = this.createJestConfig(reactScriptsLocation);

    // Set test environment to jsdom (otherwise Jest won't run)
    jestConfiguration.testEnvironment = 'jsdom';

    return jestConfiguration;
  }

  private createJestConfig(reactScriptsLocation: string): jest.Configuration {
    return createReactJestConfig(
      (relativePath: string): string => path.join(reactScriptsLocation, relativePath),
      this.projectRoot,
      false
    );
  }
}
