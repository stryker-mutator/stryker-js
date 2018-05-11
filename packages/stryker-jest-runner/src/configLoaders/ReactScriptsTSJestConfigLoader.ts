import JestConfigLoader from './JestConfigLoader';
import { createReactTsJestConfig } from '../utils/createReactJestConfig';
import * as path from 'path';
import JestConfiguration from './JestConfiguration';

export default class ReactScriptsTSJestConfigLoader implements JestConfigLoader {
  private loader: NodeRequire;
  private projectRoot: string;

  public constructor(projectRoot: string, loader?: NodeRequire) {
    this.loader = loader || /* istanbul ignore next */ require;
    this.projectRoot = projectRoot;
  }

  public loadConfig(): JestConfiguration {
    // Get the location of react-ts script, this is later used to generate the Jest configuration used for React projects.
    const reactScriptsTsLocation = path.join(this.loader.resolve('react-scripts-ts/package.json'), '..');

    // Create the React configuration for Jest
    const jestConfiguration = this.createJestConfig(reactScriptsTsLocation);

    // Set test environment to jsdom (otherwise Jest won't run)
    jestConfiguration.testEnvironment = 'jsdom';

    return jestConfiguration;
  }

  private createJestConfig(reactScriptsTsLocation: string): any {
    return createReactTsJestConfig(
      (relativePath: string): string => path.join(reactScriptsTsLocation, relativePath),
      this.projectRoot,
      false
    );
  }
}