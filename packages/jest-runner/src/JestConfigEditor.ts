import { Config, ConfigEditor } from '@stryker-mutator/api/config';
import JestConfigLoader from './configLoaders/JestConfigLoader';
import CustomJestConfigLoader from './configLoaders/CustomJestConfigLoader';
import ReactScriptsJestConfigLoader from './configLoaders/ReactScriptsJestConfigLoader';
import ReactScriptsTSJestConfigLoader from './configLoaders/ReactScriptsTSJestConfigLoader';
import JEST_OVERRIDE_OPTIONS from './jestOverrideOptions';
import jest from 'jest';

const defaultProjectName = 'custom';

export default class JestConfigEditor implements ConfigEditor {

  public edit(strykerConfig: Config): void {
    // If there is no Jest property on the Stryker config create it
    strykerConfig.jest = strykerConfig.jest || {};

    // When no projectType is set, set it to the default
    strykerConfig.jest.projectType = strykerConfig.jest.projectType || strykerConfig.jest.project || defaultProjectName;

    // When no config property is set, load the configuration with the project type
    strykerConfig.jest.config = strykerConfig.jest.config || this.getConfigLoader(strykerConfig.jest.projectType).loadConfig();

    // Override some of the config properties to optimise Jest for Stryker
    strykerConfig.jest.config = this.overrideProperties(strykerConfig.jest.config);
  }

  private getConfigLoader(projectType: string): JestConfigLoader {
    switch (projectType.toLowerCase()) {
      case defaultProjectName:
        return new CustomJestConfigLoader(process.cwd());
      case 'react':
        return new ReactScriptsJestConfigLoader(process.cwd());
      case 'react-ts':
        return new ReactScriptsTSJestConfigLoader(process.cwd());
      default:
        throw new Error(`No configLoader available for ${projectType}`);
    }
  }

  private overrideProperties(config: jest.Configuration) {
    return Object.assign(config, JEST_OVERRIDE_OPTIONS);
  }
}
