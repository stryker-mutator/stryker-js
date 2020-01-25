import { Config, ConfigEditor } from '@stryker-mutator/api/config';
import { Logger } from '@stryker-mutator/api/logging';
import jest from 'jest';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';

import CustomJestConfigLoader from './configLoaders/CustomJestConfigLoader';
import JestConfigLoader from './configLoaders/JestConfigLoader';
import ReactScriptsJestConfigLoader from './configLoaders/ReactScriptsJestConfigLoader';
import ReactScriptsTSJestConfigLoader from './configLoaders/ReactScriptsTSJestConfigLoader';
import JEST_OVERRIDE_OPTIONS from './jestOverrideOptions';

const DEFAULT_PROJECT_NAME = 'custom';

export default class JestConfigEditor implements ConfigEditor {
  public static inject = tokens(commonTokens.logger);

  constructor(private readonly log: Logger) {}

  public edit(strykerConfig: Config): void {
    // If there is no Jest property on the Stryker config create it
    strykerConfig.jest = strykerConfig.jest || {};

    // When no projectType is set, set it to the default
    strykerConfig.jest.projectType = strykerConfig.jest.projectType || strykerConfig.jest.project || DEFAULT_PROJECT_NAME;

    // When no config property is set, load the configuration with the project type
    strykerConfig.jest.config = strykerConfig.jest.config || this.getConfigLoader(strykerConfig.jest.projectType).loadConfig();

    // Override some of the config properties to optimise Jest for Stryker
    strykerConfig.jest.config = this.overrideProperties(strykerConfig.jest.config);
  }

  private getConfigLoader(projectType: string): JestConfigLoader {
    switch (projectType.toLowerCase()) {
      case DEFAULT_PROJECT_NAME:
        return new CustomJestConfigLoader(process.cwd());
      case 'create-react-app':
        return new ReactScriptsJestConfigLoader(process.cwd());
      case 'create-react-app-ts':
        return new ReactScriptsTSJestConfigLoader(process.cwd());
      case 'react':
        this.log.warn(
          'DEPRECATED: The projectType "react" is deprecated. Use projectType "create-react-app" for react projects created by "create-react-app" or use "custom" for other react projects.'
        );
        return new ReactScriptsJestConfigLoader(process.cwd());
      case 'react-ts':
        this.log.warn(
          'DEPRECATED: The projectType "react-ts" is deprecated. Use projectType "create-react-app-ts" for react projects created by "create-react-app" or use "custom" for other react projects.'
        );
        return new ReactScriptsTSJestConfigLoader(process.cwd());
      default:
        throw new Error(`No configLoader available for ${projectType}`);
    }
  }

  private overrideProperties(config: jest.Configuration) {
    return Object.assign(config, JEST_OVERRIDE_OPTIONS);
  }
}
