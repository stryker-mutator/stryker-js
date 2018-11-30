import * as fs from 'fs';
import { Config, ConfigEditor } from 'stryker-api/config';
import JestConfigLoader from './configLoaders/JestConfigLoader';
import CustomJestConfigLoader from './configLoaders/CustomJestConfigLoader';
import ReactScriptsJestConfigLoader from './configLoaders/ReactScriptsJestConfigLoader';
import ReactScriptsTSJestConfigLoader from './configLoaders/ReactScriptsTSJestConfigLoader';
import JEST_OVERRIDE_OPTIONS from './jestOverrideOptions';
import { Configuration } from 'jest';
import { getLogger } from 'stryker-api/logging';
import { TestRunnerSettings } from 'stryker-api/core';

const DEFAULT_PROJECT_NAME = 'custom';
const DEFAULT_PROJECT_NAME_DEPRECATED = 'default';

export default class JestConfigEditor implements ConfigEditor {

  public log = getLogger(JestConfigEditor.name);

  public edit(strykerConfig: Config): void {
    const settings: TestRunnerSettings = strykerConfig.testRunner.settings || {};

    if (settings.project) {
      this.log.warn('DEPRECATED: `jest.project` is renamed to `jest.projectType`. Please change it in your stryker configuration.');
    }

    // When no projectType is set, set it to the default
    settings.projectType = settings.projectType || settings.project || DEFAULT_PROJECT_NAME;

    if (settings.projectType && settings.projectType.toLowerCase() === DEFAULT_PROJECT_NAME_DEPRECATED) {
      this.log.warn(`DEPRECATED: The '${DEFAULT_PROJECT_NAME_DEPRECATED}' \`jest.projectType\` is renamed to '${DEFAULT_PROJECT_NAME}'. Please rename it in your stryker configuration.`);
      settings.projectType = DEFAULT_PROJECT_NAME;
    }

    // When no config property is set, load the configuration with the project type
    const config = (settings.config as Configuration) || this.getConfigLoader(settings.projectType || DEFAULT_PROJECT_NAME).loadConfig();

    // Override some of the config properties to optimise Jest for Stryker
    settings.config = this.overrideProperties(config);

    strykerConfig.testRunner.settings = settings;
  }

  private getConfigLoader(projectType: string): JestConfigLoader {
    switch (projectType.toLowerCase()) {
      case DEFAULT_PROJECT_NAME:
        return new CustomJestConfigLoader(process.cwd(), fs);
      case 'react':
        return new ReactScriptsJestConfigLoader(process.cwd());
      case 'react-ts':
        return new ReactScriptsTSJestConfigLoader(process.cwd());
      default:
        throw new Error(`No configLoader available for ${projectType}`);
    }
  }

  private overrideProperties(config: Configuration) {
    return Object.assign(config, JEST_OVERRIDE_OPTIONS);
  }
}
