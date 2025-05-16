import { tokens, commonTokens, Injector } from '@stryker-mutator/api/plugin';
import { StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';

import { JestRunnerOptionsWithStrykerOptions } from '../jest-runner-options-with-stryker-options.js';
import { JestPluginContext } from '../plugin-di.js';

import { CustomJestConfigLoader } from './custom-jest-config-loader.js';
import { ReactScriptsJestConfigLoader } from './react-scripts-jest-config-loader.js';

configLoaderFactory.inject = tokens(
  commonTokens.options,
  commonTokens.injector,
  commonTokens.logger,
);
export function configLoaderFactory(
  options: StrykerOptions,
  injector: Injector<JestPluginContext>,
  log: Logger,
): CustomJestConfigLoader | ReactScriptsJestConfigLoader {
  const warnAboutConfigFile = (
    projectType: string,
    configFile: string | undefined,
  ) => {
    if (configFile) {
      log.warn(
        `Config setting "configFile" is not supported for projectType "${projectType}"`,
      );
    }
  };
  const optionsWithJest: JestRunnerOptionsWithStrykerOptions =
    options as JestRunnerOptionsWithStrykerOptions;
  switch (optionsWithJest.jest.projectType) {
    case 'custom':
      return injector.injectClass(CustomJestConfigLoader);
    case 'create-react-app':
      warnAboutConfigFile(
        optionsWithJest.jest.projectType,
        optionsWithJest.jest.configFile,
      );
      return injector.injectClass(ReactScriptsJestConfigLoader);
    default:
      throw new Error(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `No configLoader available for ${optionsWithJest.jest.projectType satisfies never}`,
      );
  }
}
