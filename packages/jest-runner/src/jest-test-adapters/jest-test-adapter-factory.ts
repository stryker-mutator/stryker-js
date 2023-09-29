import { Logger } from '@stryker-mutator/api/logging';
import { StrykerOptions } from '@stryker-mutator/api/core';
import { commonTokens, Injector, tokens } from '@stryker-mutator/api/plugin';
import semver from 'semver';

import { JestPluginContext, pluginTokens } from '../plugin-di.js';
import { JestWrapper } from '../utils/jest-wrapper.js';

import { JestLessThan25TestAdapter } from './jest-less-than-25-adapter.js';
import { JestGreaterThan25TestAdapter } from './jest-greater-than-25-adapter.js';

export function jestTestAdapterFactory(
  log: Logger,
  jestWrapper: JestWrapper,
  options: StrykerOptions,
  injector: Injector<JestPluginContext>,
): JestGreaterThan25TestAdapter | JestLessThan25TestAdapter {
  const version = jestWrapper.getVersion();
  log.debug('Detected Jest version %s', version);
  guardJestVersion(version, options, log);

  if (semver.satisfies(version, '<25.0.0')) {
    return injector.injectClass(JestLessThan25TestAdapter);
  } else {
    return injector.injectClass(JestGreaterThan25TestAdapter);
  }
}
jestTestAdapterFactory.inject = tokens(commonTokens.logger, pluginTokens.jestWrapper, commonTokens.options, commonTokens.injector);

function guardJestVersion(jest: string, options: StrykerOptions, log: Logger) {
  if (semver.satisfies(jest, '<22.0.0')) {
    throw new Error(`You need Jest version >= 22.0.0 to use the @stryker-mutator/jest-runner plugin, found ${jest}`);
  } else if (semver.satisfies(jest, '<24')) {
    if (options.coverageAnalysis !== 'off') {
      throw new Error(
        `You need Jest version >= 24.0.0 to use the @stryker-mutator/jest-runner with "coverageAnalysis": "${options.coverageAnalysis}", you're currently using version 23.0.0. Please upgrade your jest version, or set "coverageAnalysis": "off".`,
      );
    }
    log.warn(
      '[DEPRECATED] Support for Jest version < 24 is deprecated and will be removed in the next major version of Stryker, please upgrade your jest version (your current version is %s).',
      jest,
    );
  }
}
