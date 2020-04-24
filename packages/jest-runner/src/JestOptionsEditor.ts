import { Logger } from '@stryker-mutator/api/logging';
import { commonTokens, tokens } from '@stryker-mutator/api/plugin';
import { OptionsEditor } from '@stryker-mutator/api/core';

import CustomJestConfigLoader from './configLoaders/CustomJestConfigLoader';
import JestConfigLoader from './configLoaders/JestConfigLoader';
import ReactScriptsJestConfigLoader from './configLoaders/ReactScriptsJestConfigLoader';
import ReactScriptsTSJestConfigLoader from './configLoaders/ReactScriptsTSJestConfigLoader';
import JEST_OVERRIDE_OPTIONS from './jestOverrideOptions';
import { JestRunnerOptionsWithStrykerOptions } from './JestRunnerOptionsWithStrykerOptions';

const DEFAULT_PROJECT_NAME = 'custom';

export default class JestOptionsEditor implements OptionsEditor<JestRunnerOptionsWithStrykerOptions> {
  public static inject = tokens(commonTokens.logger);

  constructor(private readonly log: Logger) {}

  public edit(options: JestRunnerOptionsWithStrykerOptions): void {
    // When no config property is set, load the configuration with the project type
    options.jest.config = options.jest.config || (this.getConfigLoader(options.jest.projectType).loadConfig() as any);

    // Override some of the config properties to optimise Jest for Stryker
    options.jest.config = this.overrideProperties((options.jest.config as unknown) as Jest.Configuration);
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

  private overrideProperties(config: Jest.Configuration) {
    return { ...config, ...JEST_OVERRIDE_OPTIONS };
  }
}
