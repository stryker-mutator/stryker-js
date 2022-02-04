import { createRequire } from 'module';

import { tokens, commonTokens, Injector, PluginContext } from '@stryker-mutator/api/plugin';
import { StrykerOptions } from '@stryker-mutator/api/core';
import { Logger } from '@stryker-mutator/api/logging';

import { requireResolve } from '@stryker-mutator/util';

import { JestRunnerOptionsWithStrykerOptions } from '../jest-runner-options-with-stryker-options.js';
import * as pluginTokens from '../plugin-tokens.js';

import { CustomJestConfigLoader } from './custom-jest-config-loader.js';
import { ReactScriptsJestConfigLoader } from './react-scripts-jest-config-loader.js';

configLoaderFactory.inject = tokens(commonTokens.options, commonTokens.injector, commonTokens.logger);
export function configLoaderFactory(
  options: StrykerOptions,
  injector: Injector<PluginContext>,
  log: Logger
): CustomJestConfigLoader | ReactScriptsJestConfigLoader {
  const warnAboutConfigFile = (projectType: string, configFile: string | undefined) => {
    if (configFile) {
      log.warn(`Config setting "configFile" is not supported for projectType "${projectType}"`);
    }
  };
  const optionsWithJest: JestRunnerOptionsWithStrykerOptions = options as JestRunnerOptionsWithStrykerOptions;
  const configLoaderInjector = injector
    .provideValue(pluginTokens.resolve, createRequire(import.meta.url).resolve)
    .provideValue(pluginTokens.requireFromCwd, requireResolve);

  switch (optionsWithJest.jest.projectType) {
    case 'custom':
      return configLoaderInjector.injectClass(CustomJestConfigLoader);
    case 'create-react-app':
      warnAboutConfigFile(optionsWithJest.jest.projectType, optionsWithJest.jest.configFile);
      return configLoaderInjector.injectClass(ReactScriptsJestConfigLoader);
    default:
      throw new Error(`No configLoader available for ${optionsWithJest.jest.projectType}`);
  }
}
