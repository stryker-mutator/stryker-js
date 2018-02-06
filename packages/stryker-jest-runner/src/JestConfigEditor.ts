import * as fs from 'fs';
import { Config, ConfigEditor } from 'stryker-api/config';
import JestConfigLoader from './configLoaders/JestConfigLoader';
import DefaultJestConfigLoader from './configLoaders/DefaultJestConfigLoader';
import ReactScriptsJestConfigLoader from './configLoaders/ReactScriptsJestConfigLoader';

const DEFAULT_PROJECT_NAME = 'default';

export default class JestConfigEditor implements ConfigEditor {
  public edit(strykerConfig: Config): void {
    // If there is no Jest property on the Stryker config create it
    strykerConfig.jest = strykerConfig.jest || {};

    // When no project is set set it to 'default'
    strykerConfig.jest.project = strykerConfig.jest.project || DEFAULT_PROJECT_NAME;

    // When no config property is set load the configuration with the project type
    strykerConfig.jest.config = strykerConfig.jest.config || this.getConfigLoader(strykerConfig.jest.project).loadConfig();
  }

  private getConfigLoader(project: string): JestConfigLoader {
    let configLoader: JestConfigLoader;

    switch (project.toLowerCase()) {
      case DEFAULT_PROJECT_NAME:
        configLoader = new DefaultJestConfigLoader(process.cwd(), fs);
      break;
      case 'react':
        configLoader = new ReactScriptsJestConfigLoader(process.cwd());
      break;
      default:
        throw new Error(`No configLoader available for ${project}`);
    }

    return configLoader;
  }
}