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
    try {
      const reactScriptsTsLocation = path.join(this.loader.resolve('react-scripts-ts/package.json'), '..');
      // Create the React configuration for Jest
      const jestConfiguration = this.createJestConfig(reactScriptsTsLocation);

      // Set test environment to jsdom (otherwise Jest won't run)
      jestConfiguration.testEnvironment = 'jsdom';

      return jestConfiguration;
    }
    catch (e) {
      if (this.isNodeErrnoException(e) && e.code === 'MODULE_NOT_FOUND') {
        throw Error('Unable to locate package react-scripts-ts. ' +
          'This package is required when projectType is set to "react-ts".');
      } else {
        throw e;
      }
    }
  }

  private isNodeErrnoException(arg: any): arg is NodeJS.ErrnoException {
    return arg.code !== undefined;
  }

  private createJestConfig(reactScriptsTsLocation: string): jest.Configuration {
    return createReactTsJestConfig(
      (relativePath: string): string => path.join(reactScriptsTsLocation, relativePath),
      this.projectRoot,
      false
    );
  }
}
